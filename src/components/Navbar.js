import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Label, Segment, Icon, Popup } from 'semantic-ui-react';

const Navbar = () =>
  (
    <Segment style={{ textAlign: 'justified', padding: '0px', borderTop: '1px solid #00b5ad', borderBottom: '1px solid #00b5ad' }}>

      <Popup
        trigger={
          <Button as='div' labelPosition='right'>
            <Button color='teal' basic>
              <Icon name='picture' />
              <span style={{ fontFamily: '"Arial Black", Gadget, sans-serif' }}>PhotoAnalyzer</span>
            </Button>
            <Label pointing='left' color='teal'>
              <span>...</span>
            </Label>
          </Button>}
        content={<ul>
          <li>Your photos are tagged upon uploading with the power of AI!</li>
          <li>Click on a photo to see what AI can detect!</li>
          <li>Click "Search Tags" to find the photos with matching tags.</li>
        </ul>}
        position='bottom right'
      />
      <div style={{ display: 'inline', float: 'right' }}>
      <NavLink to='/' >
        <Button as='div' labelPosition='right'>
          <Button color='teal' inverted animated='fade'>
            <span style={{color:'teal',paddingRight:'10px'}}>Manage Albums</span>
          </Button>
          <Label pointing='left' color='teal' >
            <span><Icon name='address book outline' /></span>
            </Label>
        </Button>
        </NavLink>

        <NavLink to='/search' >
        <Button as='div' labelPosition='right'>
          <Button color='teal' inverted animated='fade'>
            <span style={{color:'teal',paddingRight:'10px'}}>Search Tags</span>
          </Button>
          <Label pointing='left' color='teal'>
            <span><Icon name='search' /></span>
          </Label>
        </Button>
        </NavLink>
      </div>

    </Segment>
  )


export default Navbar;