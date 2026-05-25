import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import profileimg from '../../../assets/profile-user.png';
import * as profileData from './data';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { useAuth } from '../../../context/authContext';
import '../../../css/component/profile.css';

const Profile = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-container">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="profile-trigger">
            <img 
              src={profileimg} 
              alt="profile" 
              className="profile-avatar" 
            />
            <div className="profile-info">
              <p className="profile-name">{user?.name || "Usuario"}</p>
              <p className="profile-role">Administrador</p>
            </div>
            <Icon 
              icon="solar:alt-arrow-down-linear" 
              width={16} 
              className="profile-chevron"
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="profile-dropdown w-[240px] p-0"
        >
          {/* Header del dropdown */}
          <div className="profile-dropdown-header">
            <img 
              src={profileimg} 
              alt="profile" 
              className="profile-dropdown-avatar"
            />
            <div>
              <h4 className="profile-dropdown-name">{user?.name || "Usuario"}</h4>
              <p className="profile-dropdown-email">{user?.email || "email@example.com"}</p>
            </div>
          </div>

          <DropdownMenuSeparator className="my-2" />

          {/* Items del menú */}
          <div className="profile-dropdown-items">
            {profileData.profileDD.map((item, index) => (
              <DropdownMenuItem
                key={index}
                asChild
                className="profile-dropdown-item"
              >
                <button onClick={() => navigate(item.url)}>
                  <Icon 
                    icon={item.icon} 
                    width={16} 
                    className="profile-item-icon"
                  />
                  <span>{item.title}</span>
                </button>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="my-2" />

          {/* Logout */}
          <div className="profile-dropdown-footer">
            <button 
              className="profile-logout-btn"
              onClick={handleLogout}
            >
              <Icon 
                icon="solar:logout-2-linear" 
                width={16}
              />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Profile;