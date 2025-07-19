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

const YellowSquaresBackground = () => {
  const SQUARE_COUNT = 100;
  const [squares, setSquares] = useState(() =>
    Array.from({ length: SQUARE_COUNT }, () => ({
      size: Math.floor(Math.random() * 18) + 12,
      top: Math.random() * 80 + 5,
      left: Math.random() * 90 + 2,
      opacity: Math.random() * 0.4 + 0.3,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSquares((prev) =>
        prev.map((sq) => ({
          // Smoothly transition to new random values
          size: Math.max(12, Math.min(30, sq.size + (Math.random() - 0.5) * 8)),
          top: Math.max(5, Math.min(85, sq.top + (Math.random() - 0.5) * 6)),
          left: Math.max(2, Math.min(92, sq.left + (Math.random() - 0.5) * 8)),
          opacity: Math.max(
            0.3,
            Math.min(0.7, sq.opacity + (Math.random() - 0.5) * 0.08)
          ),
        }))
      );
    }, 1200); // update every 1.2s

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {squares.map((sq, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${sq.top}%`,
            left: `${sq.left}%`,
            width: `${sq.size}px`,
            height: `${sq.size}px`,
            background: "#fdc700",
            opacity: sq.opacity,
            borderRadius: "4px",
            zIndex: 0,
            boxShadow: "0 2px 8px rgba(253,199,0,0.08)",
            transition: "top 1s, left 1s, width 1s, height 1s, opacity 1s",
          }}
        />
      ))}
    </div>
  );
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
    <div className="bg-base-200 relative">
      {/* Navbar */}
      <nav className="px-4 py-4 md:px-12 md:py-6 flex items-center justify-between relative">
        <img src="/logo.png" alt="OnSite360 Logo" className="w-52" />
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
        <div className="hidden bg-base-100 px-5 py-3 rounded-2xl md:flex gap-4 md:gap-5 items-center">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              className={`font-semibold px-6 py-3 rounded-lg transition-colors ${
                item.active
                  ? "bg-base-200 text-[#a35608] p-5"
                  : "text-[#1c1c1c] hover:bg-[#fdc700] hover:text-[#a35608]"
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
        </div>
        <div className="flex gap-2">
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
          <div className="fixed inset-0 bg-white/20 backdrop-blur-lg z-50 flex flex-col items-center justify-center gap-6 px-4 py-8 md:hidden animate-slide-down">
            <button
              className="absolute top-6 right-6 text-3xl font-bold text-[#a35608] bg-white rounded-full w-12 h-12 flex items-center justify-center shadow"
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              type="button"
            >
              &times;
            </button>
            {navItems.map((item, idx) => (
              <button
                key={idx}
                className={`font-semibold px-6 py-4 rounded-xl text-center w-full text-2xl transition-colors ${
                  item.active
                    ? "bg-[#fdc700] text-[#a35608]"
                    : "text-[#1c1c1c] hover:bg-[#fdc700] hover:text-[#a35608]"
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
            {/* Removed Login and Request a Demo buttons for mobile */}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center text-center py-10 px-4 md:py-20 md:px-0 relative"
        style={{ overflow: "hidden" }}
      >
        {/* --- Add the yellow squares background here --- */}
        <YellowSquaresBackground />
        {/* <P5Background /> */}
        <div className="z-50 flex flex-col justify-center items-center bg-neutral-100/10 backdrop-blur-md p-5 md:p-10 rounded-3xl  max-w-5xl mx-auto">
          <div className="text-neutral-500 z-50 text-base md:text-lg tracking-widest font-medium mb-6 break-words text-center max-w-xs sm:max-w-md md:max-w-2xl mx-auto">
            CONSTRUCTION PROJECT MANAGEMENT SOFTWARE
          </div>
          <h1 className="text-4xl md:text-7xl z-50 font-bold text-[#fdc700] mb-2">
            Shaping <span className="text-[#1c1c1c]">your vision</span>
          </h1>
          <h2 className="text-4xl md:text-7xl z-50 font-bold text-[#1c1c1c] mb-4">
            With <span className="text-[#fdc700]">Precision</span>
          </h2>

          <div className="flex gap-1 justify-center w-full z-50 mt-4">
            <button
              className="bg-[#fdc700] text-[#a45505] font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-[#e5b400]"
              onClick={handleDemoClick}
            >
              Request a Demo
            </button>{" "}
            <Link to="/login" className="md:hidden">
              <button className="bg-[#3b3b3b] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#2a2a2a] w-full">
                Login
              </button>
            </Link>
          </div>
        </div>

        {/* Glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#fdc700bf] rounded-full blur-2xl opacity-40 z-10" />
      </section>

      {/* Feature Cards */}
      <section
        ref={featureCardsRef}
        className={`flex flex-row overflow-x-auto md:flex-row items-center justify-start md:justify-center gap-4 md:gap-10 px-4 md:px-0 py-8 transition-all duration-500 ${
          hideFeatureCards
            ? "opacity-0 translate-y-32 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
        style={{ scrollbarWidth: "none" }}
      >
        {featureCards.map((card, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-center min-w-xs bg-white rounded-2xl shadow-lg p-4 cursor-pointer transition-transform duration-300 w-64 md:w-72 h-24 md:h-28 ${
              hoveredCard === idx ? "scale-110 z-10" : "scale-100"
            }`}
            onMouseEnter={() => setHoveredCard(idx)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {hoveredCard === idx ? (
              <div className="text-sm text-neutral-500 text-center mt-2">
                {featureCardDescriptions[card.title]}
              </div>
            ) : (
              <div className="font-bold text-[#e8b703] text-lg md:text-xl mb-1">
                {card.title}
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
      <section className="flex flex-col md:flex-row items-center justify-center gap-8 py-8 md:py-16 lg:px-5 px-4 md:px-0">
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
            className="btn btn-primary w-full lg:w-2xs md:w-auto"
            onClick={handleDemoClick}
          >
            Request a Demo
          </button>
        </div>
      </section>

      {/* Access Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-center gap-8 py-8 md:py-16 lg:px-10 px-4 md:px-0">
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
            understand. Information is updated instantly so all stakeholders
            have ultimate visability. Mitigate risks with accurate data logs
          </div>
          <button
            className="btn btn-primary w-full lg:w-2xs md:w-auto mt-2"
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
      <section className="flex flex-col-reverse md:flex-row items-center justify-center gap-8 py-8 md:py-16 lg:px-10 px-4 md:px-0">
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
              className="btn btn-primary lg:w-2xs w-full md:w-auto"
              onClick={handleDemoClick}
            >
              Request a Demo
            </button>
            <button
              onClick={handleInstallClick}
              className="btn btn-neutral lg:w-2xs w-full md:w-auto"
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
      <section className="flex flex-col-reverse md:flex-row items-center justify-center gap-8 py-8  lg:px-10 px-4 md:px-0 bg-accent">
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-white text-2xl md:text-6xl">
            See how Project Management can work for your team.
          </h2>
          <button
            className="btn btn-primary w-full lg:w-2xs lg:mt-10 md:w-auto mt-2"
            onClick={handleDemoClick}
          >
            Request a Demo
          </button>
        </div>
        <img src="footer_img.webp" alt="" className="w-full md:w-1/2 h-auto" />
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
      <footer className="bg-primary/15 text-[#a35608] py-8 px-4 md:px-0 lg:p-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OnSite360 Logo" className="w-48" />
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
