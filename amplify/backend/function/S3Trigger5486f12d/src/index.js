const AWS = require('aws-sdk');
const S3 = new AWS.S3({ signatureVersion: 'v4' });
const DynamoDBDocClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const uuidv4 = require('uuid/v4');
const gm = require('gm').subClass({imageMagick: true});
const { promisify } = require('util');
const Rekognition = new AWS.Rekognition();

// We'll expect these environment variables to be defined when the Lambda function is deployed
const THUMBNAIL_WIDTH = parseInt(process.env.THUMBNAIL_WIDTH, 10);
const THUMBNAIL_HEIGHT = parseInt(process.env.THUMBNAIL_HEIGHT, 10);
const DYNAMODB_PHOTOS_TABLE_NAME = process.env.DYNAMODB_PHOTOS_TABLE_ARN.split('/')[1];

async function getLabelNames(bucketName, key) {
  let params = {
    Image: {
      S3Object: {
        Bucket: bucketName, 
        Name: key
      }
    }, 
    MaxLabels: 50, 
    MinConfidence: 70
  };
  const detectionResult = await Rekognition.detectLabels(params).promise();
  const labelNames = detectionResult.Labels.map((l) => l.Name.toLowerCase()); 
  return labelNames;
}

async function getTextRec(bucketName, key) {
  let params = {
    Image: {
      S3Object: {
        Bucket: bucketName,
        Name: key
      }
    },
  };
  console.log('INSIDE getTextRec');
  const detectionResult = await Rekognition.detectText(params).promise();
  const recWords = detectionResult.TextDetections.filter( item => item.Type === 'LINE' && item.Confidence > 70).map(item => item.DetectedText)
  //console.log(detectionResult);
  return recWords;
}

function storePhotoInfo(item) {
	const params = {
		Item: item,
		TableName: DYNAMODB_PHOTOS_TABLE_NAME
	};
	return DynamoDBDocClient.put(params).promise();
}

async function getMetadata(bucketName, key) {
	const headResult = await S3.headObject({Bucket: bucketName, Key: key }).promise();
	return headResult.Metadata;
}

function thumbnailKey(filename) {
	return `public/resized/${filename}`;
}

function fullsizeKey(filename) {
	return `public/${filename}`;
}

async function resize(bucketName, key) {
  const originalPhoto = (await S3.getObject({ Bucket: bucketName, Key: key }).promise()).Body;
  console.log('got origin photo: ', bucketName, key)
  const originalPhotoName = key.replace('uploads/', '');

  const gmStream = gm(originalPhoto);
  const getSizeProm = promisify(gmStream.size).bind(gmStream);
  let originalPhotoDimensions = {width: 0, height: 0};
  try {
    originalPhotoDimensions = await getSizeProm();
    console.log('got origin dimension: ', originalPhotoDimensions)
  } catch(err){
    console.error("Error getting size: ",err)
  }

  // const thumbnail = await makeThumbnail(originalPhoto);
  const resizeOutput = gmStream.resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
  const toBufferProm = promisify(resizeOutput.toBuffer).bind(resizeOutput);
  let thumbnail = null;
  try {
    thumbnail = await toBufferProm();
    console.log('Resize done')
  } catch (err) {
    console.error("Error resizing: ",err)
  }

	await Promise.all([
		S3.putObject({
			Body: thumbnail,
			Bucket: bucketName,
			Key: thumbnailKey(originalPhotoName),
		}).promise(),

		S3.copyObject({
			Bucket: bucketName,
			CopySource: bucketName + '/' + key,
			Key: fullsizeKey(originalPhotoName),
		}).promise(),
	]);

	await S3.deleteObject({
		Bucket: bucketName,
		Key: key
	}).promise();

	return {
		photoId: originalPhotoName,
		
		thumbnail: {
			key: thumbnailKey(originalPhotoName),
			width: THUMBNAIL_WIDTH,
			height: THUMBNAIL_HEIGHT
		},

		fullsize: {
			key: fullsizeKey(originalPhotoName),
			width: originalPhotoDimensions.width,
			height: originalPhotoDimensions.height
		}
	};
};

async function processRecord(record) {
	const bucketName = record.s3.bucket.name;
	const key = record.s3.object.key;
	
	if (key.indexOf('uploads') !== 0) return;
	
	const metadata = await getMetadata(bucketName, key);
	const sizes = await resize(bucketName, key);    
  if (!sizes) throw Error;
  const labelNames = await getLabelNames(bucketName, sizes.fullsize.key);
  const recWords = await getTextRec(bucketName, sizes.fullsize.key);
  console.log('recWords: ', recWords);

  const id = uuidv4();
	const item = {
		id: id,
    owner: metadata.owner,
    labels: labelNames,
    words: recWords,
		photoAlbumId: metadata.albumid,
		bucket: bucketName,
		thumbnail: sizes.thumbnail,
		fullsize: sizes.fullsize,
		createdAt: new Date().getTime()
	}
  try {
    await storePhotoInfo(item);
  } catch (err) {
    console.err(err);
  }
}

exports.handler = async (event, context, callback) => {
	try {
		event.Records.forEach(processRecord);
		callback(null, { status: 'Photo Processed' });
	}
	catch (err) {
		console.error(err);
		callback(err);
	}
};
