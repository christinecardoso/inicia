import '../css/index.css';

import Alpine from 'alpinejs'
import persist from '@alpinejs/persist';
import slugify from '@sindresorhus/slugify';
// core version + navigation, pagination modules:
import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
// import Swiper and modules styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
// import './gsap-swipper';


// Add Alpine extensions here
//banner
Alpine.data('banner', function () {
  return {
    show: this.$persist(false),
    dismissed: this.$persist(false),

    dismiss() {
      this.isOpen = false;
      this.dismissed = true;
    },

    init() {
      this.show = false;
      if (!this.dismissed) {
        setTimeout(() => {
          this.show = true;
        }, 1500);
      }
    },
  };
});

//banner
Alpine.data('isOpen', function () {
  return {
    init() {
      if (!this.isOpen) {
        setTimeout(() => {
          this.isOpen = true;
        }, 1500);
      }
    },
  };
});

Alpine.data('couponForm', function () {
  return {
    formattedPhoneNumber: '',
    isValidNumber: true,
    success: false,

    sendCoupon() {
      // Perform form validation
      if (!this.isValidPhoneNumber(this.formattedPhoneNumber)) {
        this.isValidNumber = false;
        return;
      }

      // Remove non-digit characters from the formatted phone number
      const phoneNumber = this.formattedPhoneNumber.replace(/\D/g, '');

      // Perform the necessary logic to send the image file placeholder URL via text message
      // Here, you can make an AJAX request to a server-side script or use any other method to handle the SMS sending functionality

      // Create the click-to-text link
      const clickToTextLink = document.createElement('a');
      clickToTextLink.href = `sms:${phoneNumber}?body=SAVE%2020%20today.%20Click%20on%20the%20coupon%20at%20the%20link%20http://coupon.hometownlube.com`;

      // Trigger the click event on the link to open the messaging app
      clickToTextLink.click();

      // Once the SMS is sent, set the `success` property to true to show the success page
      this.success = true;
    },

    isValidPhoneNumber(phoneNumber) {
      // US phone number validation regex pattern
      const phoneNumberPattern = /^\(\d{3}\) \d{3}-\d{4}$/;
      return phoneNumberPattern.test(phoneNumber);
    },
  };
});


Alpine.data('emailCouponForm', function () {
  return {
    emailInput: '',
    success: false,

    sendEmailCoupon() {
      // Perform form validation
      if (!isValidEmail(this.emailInput)) {
        this.isValidEmail = false;
        return;
      }

      // Perform the necessary logic to send the coupon via email
      // Here, you can make an AJAX request to a server-side script or use any other method to handle the email sending functionality

      // Once the email is sent, set the 'success' property to true
      this.success = true;
    },

    isValidEmail(emailInput) {
      // US phone number validation regex pattern
      // Regular expression pattern for email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Check if the email matches the pattern
      return emailPattern.test(emailInput);
    },


  };
});



Alpine.start()

const env = document.querySelector('body').dataset.env;

// Listen for scroll events on the window
window.addEventListener('scroll', () => {
  try {
    // Update Swiper on scroll
    // Update Swiper on scroll
    if (window.swiper) {
      window.swiper.update();
    }
    if (window.Alpine && window.Alpine.discoverComponents) {
      window.Alpine.discoverComponents();
    }
  } catch (error) {
    console.error('Error updating Swiper on scroll: ', error);
  }
});


// Check that service workers are supported
if ('serviceWorker' in navigator && env === 'production') {
  // use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    try {
      navigator.serviceWorker.register('/sw.js');
    } catch (error) {
      console.error('Service worker registration failed: ', error);
    }
  });
}

console.log('hello from index.js')
