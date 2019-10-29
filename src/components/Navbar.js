import React from 'react';
import { BrowserRouter as Router, NavLink } from 'react-router-dom';
import { Button, Label, Segment, Icon, Popup } from 'semantic-ui-react';

const Navbar = () =>
  (
    <Segment style={{ textAlign: 'justified', padding: '0px', borderTop: '1px solid var(--amazonOrange)', borderBottom: '1px solid var(--amazonOrange)' }}>

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
          <li>Tag your photos with the power of AI!</li>
          <li>Tags are searchable!</li>
        </ul>}
        position='bottom right'
      />
      <div style={{ display: 'inline', float: 'right' }}>
        <Button as='div' labelPosition='right'>
          <Button color='teal' basic>
            <NavLink to='/' >Manage Albums</NavLink>
          </Button>
          <Label pointing='left' color='teal'>
            <span><Icon name='address book outline' /></span>
          </Label>
        </Button>
        <Button as='div' labelPosition='right'>
          <Button color='teal' basic>
            <NavLink to='/search' >Search Tags</NavLink>
          </Button>
          <Label pointing='left' color='teal'>
            <span><Icon name='search' /></span>
          </Label>
        </Button>
      </div>

    </Segment>
  )


export default Navbar;