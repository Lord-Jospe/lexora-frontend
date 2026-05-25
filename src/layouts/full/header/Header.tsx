import { useState, useEffect, useEffectEvent } from 'react';
import { Icon } from '@iconify/react';
import SidebarLayout from '../sidebar/Sidebar';
import FullLogo from '../../logo/FullLogo';
import Profile from './Profile';
import Notifications from './Messages';
import Search from './Search';

import { Sheet, SheetContent, SheetTitle } from '../../../components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';


const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  // const [mobileMenu, setMobileMenu] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleScroll = useEffectEvent(() => {
    if (window.scrollY > 50) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  });

  const handleResize = useEffectEvent(() => {
    if (window.innerWidth > 1023) {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    // Use stable callbacks inside the effect
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // const handleMobileMenu = () => {
  //   if (mobileMenu === 'active') {
  //     setMobileMenu('');
  //   } else {
  //     setMobileMenu('active');
  //   }
  // };

  return (
    <>
      <header
        className={`sticky top-0 z-[2] ${
          isSticky ? 'bg-white dark:bg-dark shadow-md fixed w-full' : 'bg-transparent'
        }`}
      >
        <nav className="rounded-none bg-transparent dark:bg-transparent py-4 px-6 !max-w-full flex justify-between items-center gap-4">
          
          {/* Mobile Menu Toggle */}
          <span
            onClick={() => setIsOpen(true)}
            className="px-[15px] hover:text-primary dark:hover:text-primary text-foreground dark:text-muted-foreground relative after:absolute after:w-10 after:h-10 after:rounded-full hover:after:bg-lightprimary after:bg-transparent rounded-full xl:hidden flex justify-center items-center cursor-pointer flex-shrink-0"
          >
            <Icon icon="tabler:menu-2" height={20} />
          </span>

          {/* Logo (Mobile) */}
          <div className="block xl:hidden flex-shrink-0">
            <FullLogo />
          </div>

          {/* Search (Desktop) */}
          <div className="hidden xl:flex flex-1 max-w-xs">
            <Search />
          </div>

          {/* Search (Mobile) - SIEMPRE VISIBLE */}
          <div className="flex xl:hidden flex-1">
            <Search />
          </div>

          {/* Right Section - Notifications & Profile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notifications Dropdown */}
            <Notifications />

            {/* Profile Dropdown */}
            <Profile />
          </div>

        </nav>
      </header>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>sidebar</SheetTitle>
          </VisuallyHidden>
          <SidebarLayout onClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;