import React from 'react';
import { getUserId, uuidv4 } from './user';
import "./UserHome.css";
import { FirebaseObserver } from './util';

let UserHomeInner = ({userJson}) => {
  let worlds = (userJson || {}).worlds || {};
  worlds = Object.keys(worlds).map((k) => {
    return {...worlds[k], id: k};
  });
  worlds.sort((a, b) => {
    let date1 = a.last_opened || 0;
    let date2 = b.last_opened || 0;
    return date2 - date1;
  });
  
  let createWorld = () => {
    window.location = '/?world=' + encodeURIComponent(uuidv4());
  };
  
  return (
    <div className='UserHomeInner app-ui'>
      <div className='worlds'>{worlds.map((world) => <WorldRow world={world} key={world.id} />)}</div>
      <div className='big-button' onClick={createWorld}>New World</div>
    </div>
  )
}

let UserHome = ({database}) => {
  return <FirebaseObserver firebaseRef={database.ref('/users/' + getUserId())} render={(userJson) => <UserHomeInner userJson={userJson} />} />;
}


export default UserHome;

let WorldRow = ({world}) => {
  return <a href={'/?world=' + world.id}><div className='world-button'>{world.title || 'Untitled world'}</div></a>;
}
