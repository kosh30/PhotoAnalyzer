import React from 'react';
import { BrowserRouter as Router, NavLink } from 'react-router-dom';
import { Button, Label, Segment, Icon, Popup } from 'semantic-ui-react';

const Navbar = () =>
  (
    <Segment style={{ textAlign: 'center', padding: '0px', borderTop: '1px solid var(--amazonOrange)', borderBottom: '1px solid var(--amazonOrange)' }}>
      <Button as='div' labelPosition='right'>
        <Button color='teal' basic>
          <Icon name='picture' />
          <span style={{ fontFamily: '"Arial Black", Gadget, sans-serif' }}>PhotoAnalyzer</span>
        </Button>
        <Label pointing='left' color='teal'>
          <span style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}>Tag your photos with the power of AI</span>
        </Label>
      </Button>

      <div style={{ display: 'inline', float: 'right' }}>
        <NavLink to='/' >Go to Albums list<Icon name='address book outline' /></NavLink>
        <span style={{marginLeft:'3px'}}><Popup
          trigger={<span>Help<Icon name='help' color='blue' size='small'></Icon></span>}
          content='Click on the photo thumbnail to view AI-analyzed info'
          position='bottom right'
        /></span>
      </div>
      
    </Segment>
  )


export default Navbar;