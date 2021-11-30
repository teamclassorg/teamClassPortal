// ** React Imports
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ** Custom Components
import Avatar from '@components/avatar';

// ** Utils
import { isUserLoggedIn } from '@utils';

// ** Store & Actions
import { useDispatch } from 'react-redux';
import { handleLogout } from '@store/actions/auth';

// ** Third Party Components
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap';
import { User, Mail, CheckSquare, MessageSquare, Settings, CreditCard, HelpCircle, Power } from 'react-feather';

// ** Default Avatar Image
import defaultAvatar from '@src/assets/images/portrait/small/avatar-s-11.jpg';
import { getUserData } from '../../../../utility/Utils';
import { logoutUser } from '../../../../utility/RealmApolloClient';

const UserDropdown = () => {
  // ** Store Vars
  const dispatch = useDispatch();

  // ** State
  const [userData, setUserData] = useState(null);

  //** ComponentDidMount
  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(getUserData());
    }
  }, []);

  return (
    <UncontrolledDropdown tag="li" className="dropdown-user nav-item">
      <DropdownToggle href="/" tag="a" className="nav-link dropdown-user-link" onClick={(e) => e.preventDefault()}>
        <div className="user-nav d-sm-flex d-none">
          <span className="user-name font-weight-bold">{(userData && userData.customData && userData.customData['name']) || 'Unknown'}</span>
          <span className="user-status">{(userData && userData.customData && userData.customData['role']) || ''}</span>
        </div>
        <Avatar color={`light-dark`} content={(userData && userData.customData && userData.customData['name']) || 'Unknown'} initials />
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem tag={Link} to="/login" onClick={() => logoutUser()}>
          <Power size={14} className="mr-75" />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default UserDropdown;
