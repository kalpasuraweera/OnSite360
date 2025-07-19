import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const featureCardDescriptions: Record<string, string> = {
  "Employee Management":
    "Manage your workforce efficiently and track employee progress.",
  "Schedule Management":
    "Plan, assign, and monitor project schedules in real time.",
  "Project Oversight": "Gain insights and control over all ongoing projects.",
  "Workforce Management": "Optimize labor allocation and productivity on site.",
  "Document Management": "Centralize and secure all your project documents.",
};

const Home = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hideFeatureCards, setHideFeatureCards] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const featureCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);
  // Navigation menu items
  const navItems = [
    { name: "Home", active: true },
    { name: "Solutions", active: false },
    { name: "Product", active: false },
    { name: "Support", active: false },
  ];

  // Hamburger menu state
  const [navOpen, setNavOpen] = useState(false);

  // Feature cards data
  const featureCards = [
    { title: "Employee Management" },
    { title: "Schedule Management" },
    { title: "Project Oversight" },
    { title: "Workforce Management" },
    { title: "Document Management" },
  ];

  // Dashboard screenshots
  const screenshots = [
    {
      src: "/middle_2.png",
      alt: "Project Status Distribution",
      key: "chart1",
    },
    {
      src: "/main-r.png",
      alt: "Monthly Project Activity",
      key: "chart2",
    },
    {
      src: "/main-l.png",
      alt: "Workforce Management",
      key: "chart3",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!featureCardsRef.current) return;
      const rect = featureCardsRef.current.getBoundingClientRect();
      setHideFeatureCards(rect.top < -100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper for all "Request a Demo" buttons
  const handleDemoClick = () => setShowDemoModal(true);

  // Handle demo form submit
  const handleDemoFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDemoModal(false);
    setShowThankYouModal(true);
  };

  // Install PWA handler
  const handleInstallClick = async () => {
    if (!showInstallButton) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promptEvent = deferredPrompt as any;
    if (!promptEvent) return;
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === "accepted") {
      console.log("✅ App installed");
    } else {
      console.log("❌ Install dismissed");
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  return (
    <div className="">
      {/* Navbar */}

      {/* Toggle button */}
      {/* <div className="flex-none">
          <label className="swap swap-rotate">
            <input
              type="checkbox"
              className="theme-controller"
              checked={theme === "halloween"}
              onChange={handleThemeToggle}
            />

         
            <svg
              className="swap-off h-10 w-10 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>

            
            <svg
              className="swap-on h-10 w-10 fill-current"
  return (
    <div className="bg-white min-h-screen w-full flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-4 py-4 md:px-12 md:py-6 flex items-center justify-between relative">
        <img src="/logo.png" alt="OnSite360 Logo" className="w-32" />
        {/* Hamburger icon for mobile */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none"
          aria-label="Toggle navigation"
          onClick={() => setNavOpen((open) => !open)}
        >
          <svg
            className="h-7 w-7 text-[#a35608]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {navOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        {/* Desktop nav links */}
        <div className="hidden md:flex gap-4 md:gap-10 items-center">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              className={`font-semibold px-4 py-2 rounded-lg ${
                item.active ? "bg-[#fdc700] text-[#a35608]" : "text-[#1c1c1c]"
              }`}
              onClick={() => {
                const section = document.getElementById(
                  item.name.toLowerCase()
                );
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {item.name}
            </button>
          ))}
          <Link to="/login">
            <button className="bg-[#3b3b3b] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2a2a2a]">
              Login
            </button>
          </Link>
          <button
            className="bg-[#fdc700] text-[#a35608] px-6 py-2 rounded-lg font-medium hover:bg-[#e5b400]"
            onClick={handleDemoClick}
          >
            Request a Demo
          </button>
        </div>
        {/* Mobile nav links dropdown */}
        {navOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50 flex flex-col gap-2 py-4 px-4 md:hidden animate-slide-down">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                className={`font-semibold px-4 py-2 rounded-lg text-left ${
                  item.active ? "bg-[#fdc700] text-[#a35608]" : "text-[#1c1c1c]"
                }`}
                onClick={() => {
                  setNavOpen(false);
                  const section = document.getElementById(
                    item.name.toLowerCase()
                  );
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {item.name}
              </button>
            ))}
            <Link to="/login">
              <button className="bg-[#3b3b3b] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2a2a2a] w-full text-left">
                Login
              </button>
            </Link>
            <button
              className="bg-[#fdc700] text-[#a35608] px-6 py-2 rounded-lg font-medium hover:bg-[#e5b400] w-full text-left"
              onClick={() => {
                setNavOpen(false);
                handleDemoClick();
              }}
            >
              Request a Demo
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-10 px-4 md:py-20 md:px-0 relative">
        <h1 className="text-4xl md:text-6xl font-bold text-[#fdc700] mb-2">
          Shaping <span className="text-[#1c1c1c]">your vision</span>
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold text-[#1c1c1c] mb-4">
          With <span className="text-[#fdc700]">precision</span>
        </h2>
        <div className="text-neutral-500 text-base md:text-lg tracking-widest font-medium mb-6 break-words text-center max-w-xs sm:max-w-md md:max-w-2xl mx-auto">
          CONSTRUCTION PROJECT MANAGEMENT SOFTWARE
        </div>
        <button
          className="bg-[#fdc700] text-[#a45505] font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-[#e5b400] mt-4"
          onClick={handleDemoClick}
        >
          Request a Demo
        </button>
        {/* Glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#fdc700bf] rounded-full blur-2xl opacity-40 -z-10" />
      </section>

      {/* Feature Cards */}
      <section
        ref={featureCardsRef}
        className={`flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 px-4 md:px-0 py-8 transition-all duration-500 ${
          hideFeatureCards
            ? "opacity-0 translate-y-32 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        {featureCards.map((card, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-4 cursor-pointer transition-transform duration-300 w-full md:w-72 h-24 md:h-28 ${
              hoveredCard === idx ? "scale-105 z-10" : "scale-100"
            }`}
            onMouseEnter={() => setHoveredCard(idx)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="font-bold text-[#e8b703] text-lg md:text-xl mb-1">
              {card.title}
            </div>
            {hoveredCard === idx && (
              <div className="text-sm text-neutral-500 text-center mt-2">
                {featureCardDescriptions[card.title]}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Dashboard Screenshot */}
      <section className="flex flex-col items-center justify-center py-8 md:py-16 px-4 md:px-0">
        <img
          src={screenshots[0].src}
          alt={screenshots[0].alt}
          className="object-contain w-full md:w-2/3 h-auto rounded-xl shadow"
        />
      </section>

      {/* Companies Section */}
      <section className="flex flex-col items-center justify-center gap-6 py-8 md:py-16 px-4 md:px-0">
        <h1 className="text-2xl md:text-4xl text-[#a45505] font-normal text-center">
          The best in building own their success with OnSite360
        </h1>
        <img
          src="/company_scroll.png"
          alt="companies"
          className="w-full md:w-1/2"
        />
      </section>

      {/* Communication Section */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 md:py-16 px-4 md:px-0">
        <img
          src="main-m.png"
          alt=""
          className="w-full md:w-1/2 h-auto rounded-xl"
        />
        <div className="flex flex-col gap-4">
          <div className="font-medium text-black text-lg tracking-widest">
            COMMUNICATION
          </div>
          <h2 className="font-bold text-[#1c1c1c] text-2xl md:text-4xl">
            Close the communication loop.
          </h2>
          <p className="text-[#434343] text-base md:text-lg">
            Mobile collaboration tools are built for the site, making it easy
            for everyone to have a clear understanding of what needs to get done
            every day to stay on schedule and prevent rework.
          </p>
          <button
            className="btn btn-primary w-full md:w-auto"
            onClick={handleDemoClick}
          >
            Request a Demo
          </button>
        </div>
      </section>

      {/* Access Section */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 md:py-16 px-4 md:px-0">
        <div className="flex flex-col gap-4">
          <div className="font-medium text-black text-lg tracking-widest">
            ACCESS
          </div>
          <h2 className="font-bold text-[#1c1c1c] text-2xl md:text-4xl">
            Keep information accurate.
          </h2>
          <div className="text-[#434343] text-base md:text-lg">
            Trust that all stakeholders have access to the latest information in
            a centralised location, and in a format that everyone can
            understand.
            <br />
            <br />
            Information is updated instantly so all stakeholders have ultimate
            visability
            <br />
            <br />
            Mitigate risks with accurate data logs
          </div>
          <button
            className="btn btn-primary w-full md:w-auto mt-2"
            onClick={handleDemoClick}
          >
            Request a Demo
          </button>
        </div>
        <img
          src="main-m.png"
          alt=""
          className="w-full md:w-1/2 h-auto rounded-xl"
        />
      </section>

      {/* Visibility Section */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 md:py-16 px-4 md:px-0">
        <div className="flex flex-col gap-4">
          <div className="font-medium text-black text-lg tracking-widest">
            VISIBILITY
          </div>
          <h2 className="font-bold text-[#1c1c1c] text-2xl md:text-4xl">
            Stay ahead of your projects.
          </h2>
          <div className="text-[#434343] text-base md:text-lg">
            Quickly identify potential issues and their impact to schedule and
            budgets. Avoid unwanted surprises with better project visibility.
            <br />
            <br />
            Project overview gives a complete picture of any outstanding items.
            <br />
            <br />
            Track all steps and speed up the approval process.
          </div>
          <div className="flex flex-col md:flex-row gap-2 mt-2 w-full">
            <button
              className="btn btn-primary w-full md:w-auto"
              onClick={handleDemoClick}
            >
              Request a Demo
            </button>
            <button
              onClick={handleInstallClick}
              className="btn btn-neutral w-full md:w-auto"
            >
              Get Mobile App
            </button>
          </div>
        </div>
        <img
          src="mobile.jpeg"
          alt=""
          className="w-full md:w-1/3 h-auto rounded-xl"
        />
      </section>

      {/* Project Management CTA Section */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 md:py-16 px-4 md:px-0 bg-accent">
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-white text-2xl md:text-4xl">
            See how Project Management can work for your team.
          </h2>
          <button
            className="btn btn-primary w-full md:w-auto mt-2"
            onClick={handleDemoClick}
          >
            Request a Demo
          </button>
        </div>
        <img
          src="footer_img.webp"
          alt=""
          className="w-full md:w-1/2 h-auto rounded-xl"
        />
      </section>

      {/* DaisyUI Modal using modal/modal-open classes */}
      {showDemoModal && (
        <div className="modal modal-open backdrop-blur-md">
          <div className="modal-box max-w-md md:max-w-2xl py-5 px-4 md:px-10 relative">
            {/* Close icon at top right */}
            <button
              className="btn btn-sm btn-circle absolute right-4 top-4"
              onClick={() => setShowDemoModal(false)}
              aria-label="Close"
              type="button"
            >
              ✕
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10">
              Unlock our product demo
            </h2>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={handleDemoFormSubmit}
            >
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="flex-1">
                  <label className="block font-medium mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="input input-bordered w-full bg-[#f6f8fa]"
                    type="text"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-medium mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="input input-bordered w-full bg-[#f6f8fa]"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="flex-1">
                  <input
                    className="input input-bordered w-full bg-[#f6f8fa]"
                    type="tel"
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div className="flex-1">
                  <input
                    className="input input-bordered w-full bg-[#f6f8fa]"
                    type="text"
                    placeholder="Company *"
                    required
                  />
                </div>
              </div>
              <div>
                <input
                  className="input input-bordered w-full bg-[#f6f8fa]"
                  type="email"
                  placeholder="Email *"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  className="select select-bordered w-full bg-[#f6f8fa]"
                  required
                >
                  <option value="">Select</option>
                  <option value="us">United States</option>
                  <option value="ca">Canada</option>
                  <option value="uk">United Kingdom</option>
                  {/* ...other countries... */}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">
                  Which builder type best describes your business?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className="select select-bordered w-full bg-[#f6f8fa]"
                  required
                >
                  <option value="">Select</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  {/* ...other types... */}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">
                  What is your average annual revenue?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className="select select-bordered w-full bg-[#f6f8fa]"
                  required
                >
                  <option value="">Select</option>
                  <option value="under1m">Under $1M</option>
                  <option value="1m-5m">$1M - $5M</option>
                  <option value="5m-20m">$5M - $20M</option>
                  <option value="over20m">Over $20M</option>
                </select>
              </div>
              <div className="pt-2 md:pt-4">
                <button
                  type="submit"
                  className="btn btn-primary w-full font-bold text-black"
                >
                  Unlock Demo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Thank You Modal */}
      {showThankYouModal && (
        <div className="modal modal-open backdrop-blur-md">
          <div className="modal-box max-w-md md:max-w-3xl py-8 px-4 md:px-8 relative">
            <button
              className="btn btn-sm btn-circle absolute right-4 top-4"
              onClick={() => setShowThankYouModal(false)}
              aria-label="Close"
              type="button"
            >
              ✕
            </button>
            <h3 className="font-bold text-3xl md:text-6xl mb-4">Thank you!</h3>
            <p className="mb-6 text-neutral-500">
              An OnSite360 member will contact you to schedule the product demo.
            </p>
            <div className="flex justify-end">
              <button
                className="btn btn-primary"
                onClick={() => setShowThankYouModal(false)}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-[#fdc700] text-[#a35608] py-8 px-4 md:px-0 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OnSite360 Logo" className="w-10 h-10" />
            <span className="font-bold text-lg">OnSite360</span>
          </div>
          <div className="text-sm text-center md:text-right">
            &copy; {new Date().getFullYear()} OnSite360. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="mailto:support@onsite360.com" className="hover:underline">
              Contact
            </a>
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
