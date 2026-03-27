import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <Image 
                src="/Logomain.png"
                alt="Pocketclass Logo"
                width={32}
                height={32}
                className={styles.logoImage}
              />
            </Link>
            <p className={styles.brandDesc}>
              The marketplace connecting expert instructors with passionate learners.
              Discover courses, join streaming sessions, and level up your skills.
            </p>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}><Mail size={14} /> hello@pocketclass.com</div>
              <div className={styles.contactItem}><MapPin size={14} /> Toronto, Canada</div>
            </div>
          </div>

          {/* Links */}
          <div className={styles.linkGroup}>
            <h4>Platform</h4>
            <Link href="/courses">Browse Courses</Link>
            <Link href="/sessions">Streaming Sessions</Link>
            <Link href="/instructors">Find Instructors</Link>
            <Link href="/register">Become an Instructor</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4>Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="#">Careers</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4>Support</h4>
            <Link href="#">Help Center</Link>
            <Link href="#">Contact Us</Link>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Pocketclass. All rights reserved.</p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="Instagram">📸</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
