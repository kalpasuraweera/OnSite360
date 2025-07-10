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

  // const theme = useSystemStore((state) => state.theme);
  // const setTheme = useSystemStore((state) => state.setTheme);

  // // Toggle between bumblebee and halloween themes
  // const handleThemeToggle = () => {
  //   setTheme(theme === "bumblebee" ? "halloween" : "bumblebee");
  // };

  // Navigation menu items
  const navItems = [
    { name: "Home", active: true },
    { name: "Solutions", active: false },
    { name: "Product", active: false },
    { name: "Support", active: false },
  ];

  // Feature cards data
  const featureCards = [
    { title: "Employee Management", top: "top-[124px]", left: "left-[394px]" },
    { title: "Schedule Management", top: "top-[113px]", left: "left-[1367px]" },
    { title: "Project Oversight", top: "top-[279px]", left: "left-[483px]" },
    { title: "Workforce Management", top: "top-[367px]", left: "left-[875px]" },
    { title: "Document Management", top: "top-[279px]", left: "left-[1274px]" },
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
      // Hide cards when scrolled more than 200px from top of viewport
      setHideFeatureCards(rect.top < -100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
        </div> */}

      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white overflow-hidden w-full flex flex-col justify-center h-[4560px] relative">
          {/* Header Navigation */}

          <button className="w-[126px] h-[47px] absolute top-[45px] left-[1280px] bg-[#3b3b3b] rounded-[10px] hover:bg-[#2a2a2a]">
            <Link
              to={"/login"}
              className="[font-family:'Figtree',Helvetica] font-medium text-white "
            >
              Login
            </Link>
          </button>

          <button className="w-[177px] h-[47px] absolute top-[45px] left-[1096px] bg-[#fdc700] rounded-[10px] hover:bg-[#e5b400]">
            <span className="[font-family:'Figtree',Helvetica] font-medium text-[#a35608] ">
              Request a Demo
            </span>
          </button>

          {/* Navigation bar */}
          <div className="flex w-1/3 h-[74px] items-center justify-center p-3 absolute top-8 left-[438px] bg-[#ebebeb] rounded-[20px]">
            <div className="flex gap-10 justify-evenly">
              {navItems.map((item, index) => (
                <div
                  key={index}
                  className={
                    item.active
                      ? "py-4 px-12 bg-white rounded-[20px]"
                      : "flex items-center justify-center"
                  }
                  onClick={() => {
                    const section = document.getElementById(
                      item.name.toLowerCase()
                    );
                    if (section) {
                      section.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  <span
                    className={`[font-family:'Figtree',Helvetica] font-semibold ${
                      item.active ? "text-[#e5b400]" : "text-[#1c1c1c]"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <img
            className="w-64 top-9 left-[39px] absolute"
            alt="OnSite360 Logo"
            src="/logo.png"
          />

          <div className="absolute w-[2023px] h-[2377px] top-[215px] left-[-313px]">
            <div className="absolute w-[2023px] h-[1573px] top-0 left-0">
              {/* Hero Section */}
              <div className="absolute w-[644px] h-[166px] top-0 left-[727px]">
                <div className="relative w-[640px] h-[166px]">
                  <h1 className="absolute top-0 left-0 [font-family:'Figtree',Helvetica] font-normal text-transparent text-[71px] tracking-[0] leading-[normal] whitespace-nowrap">
                    <span className="font-bold text-[#fdc700]">Shaping</span>
                    <span className="font-bold text-[#1c1c1c]">
                      {" "}
                      your vision{" "}
                    </span>
                  </h1>

                  <h1 className="absolute top-[78px] left-[49px] [font-family:'Figtree',Helvetica] font-normal text-transparent text-[73px] tracking-[0] leading-[normal]">
                    <span className="font-bold text-[#1c1c1c]">With </span>
                    <span className="font-bold text-[#fdc700]">precision</span>
                    <span className="font-bold text-[#1c1c1c]">
                      &nbsp;&nbsp;
                    </span>
                  </h1>
                </div>
              </div>

              {/* Yellow glow effects */}
              <div className="top-[339px] left-[824px] bg-[#fdc700bf] absolute w-[458px] h-[458px] rounded-[229.23px] blur-[250px]" />
              <div className="top-[30px] left-0 bg-[#fdc70094] absolute w-[458px] h-[458px] rounded-[229.23px] blur-[250px]" />
              <div className="top-[50px] left-[1564px] bg-[#fdc70085] absolute w-[458px] h-[458px] rounded-[229.23px] blur-[250px]" />
              <div className="top-[1115px] left-[266px] bg-[#fdc70085] absolute w-[458px] h-[458px] rounded-[229.23px] blur-[250px]" />

              {/* Dashboard Screenshots */}
              {/* {screenshots.map((screenshot, index) => (
                <img
                  key={index}
                  className={screenshot.className}
                  alt={screenshot.alt}
                  src={screenshot.src}
                />
              ))} */}

              {/* Feature Cards */}
              <div
                ref={featureCardsRef}
                className={`transition-all duration-500
                  ${
                    hideFeatureCards
                      ? "opacity-0 translate-y-32 pointer-events-none"
                      : "opacity-100 translate-y-0"
                  }
                `}
                style={{ position: "relative", zIndex: 20 }}
              >
                {featureCards.map((card, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center justify-center gap-2.5  absolute ${
                      card.top
                    } ${
                      card.left
                    } bg-white rounded-[20px] shadow-[0px_4px_100px_#a9a9a969] p-5 transition-transform duration-300 cursor-pointer
                    ${hoveredCard === index ? "scale-110 z-10" : "scale-100"}
                  `}
                    style={{
                      width: hoveredCard === index ? 350 : 316,
                      height: hoveredCard === index ? 120 : 85,
                    }}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center justify-center h-full">
                      <div className="[font-family:'Figtree',Helvetica] text-[#e8b703] w-full text-lg tracking-[0] leading-[normal] whitespace-nowrap font-bold">
                        {card.title}
                      </div>
                    </div>
                    {hoveredCard === index && (
                      <div className="mt-2 text-sm text-neutral-500 text-center   transition-opacity duration-200 opacity-100">
                        {featureCardDescriptions[card.title]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA button */}
            <button className="w-[214px] h-[68px] absolute top-[219px] left-[920px] bg-[#fdc700] rounded-[15px] shadow-[0px_4px_30px_#d1a500] hover:bg-[#e5b400]">
              <span className="[font-family:'Figtree',Helvetica] font-semibold text-[#a45505] text-[19px]">
                Request a Demo
              </span>
            </button>

            {/* Charts Section under CTA */}
            <div className="absolute flex justify-center top-[450px] left-[50px] w-full z-10">
              {/* Chart 1 */}
              <img
                src={screenshots[0].src}
                alt={screenshots[0].alt}
                className="object-contain w-2/3 h-full"
              />
            </div>

            <div className="flex flex-col w-full justify-center items-center top-[1400px] absolute gap-10  left-[50px]">
              <h1 className="[font-family:'Figtree',Helvetica] text-4xl text-[#a45505] font-normal">
                The best in building own their success with OnSite360
              </h1>
              <img
                src="/company_scroll.png"
                alt="companies"
                className="w-1/2 "
              />
            </div>

            {/* Communication Section */}
            <div className="absolute top-[2232px] left-[350px] flex items-center  gap-2">
              <img src="main-m.png" alt="" className="w-1/2 h-full" />
              <div className="relative h-[265px]">
                <div className="absolute -top-px left-0 [font-family:'Figtree',Helvetica] font-normal text-black text-[19px] tracking-[5.32px] leading-[normal]">
                  COMMUNICATION
                </div>

                <h2 className="absolute w-[581px] top-[42px] left-0.5 [font-family:'Figtree',Helvetica] font-bold text-[#1c1c1c] text-[52px] tracking-[0] leading-[normal]">
                  Close the communication loop.
                </h2>

                <p className="absolute w-[578px] top-48 left-[5px] [font-family:'Figtree',Helvetica] font-normal text-[#434343] tracking-[0] leading-[normal]">
                  Mobile collaboration tools are built for the site, making it
                  easy for everyone to have a clear understanding of what needs
                  to get done every day to stay on schedule and prevent rework.
                </p>
                <br />
                <button className="btn btn-primary mt-60">
                  Request a Demo
                </button>
              </div>
            </div>

            {/* Access Section */}
            <div className="absolute top-[1577px] mt-36 left-[444px] flex items-center">
              <div className="relative h-[265px]">
                <div className="absolute -top-px left-0 [font-family:'Figtree',Helvetica] font-normal text-black text-[19px] tracking-[5.32px] leading-[normal]">
                  ACCESS
                </div>

                <h2 className="absolute w-[581px] top-[42px] left-0.5 [font-family:'Figtree',Helvetica] font-bold text-[#1c1c1c] text-[52px] tracking-[0] leading-[normal]">
                  Keep information accurate.
                </h2>

                <div className="absolute w-[578px] top-48 left-[5px] [font-family:'Figtree',Helvetica]  text-[#434343]  tracking-[0] leading-[normal]">
                  Trust that all stakeholders have access to the latest
                  information in a centralised location, and in a format that
                  everyone can understand.
                  <br />
                  <br />
                  Information is updated instantly so all stakeholders have
                  ultimate visability
                  <br />
                  <br />
                  Mitigate risks with accurate data logs
                  <br />
                  <button className="btn btn-primary mt-5">
                    Request a Demo
                  </button>
                </div>
              </div>
              <img
                src="main-m.png"
                alt=""
                className="relative left-[570px] w-1/2 h-full"
              />
            </div>

            {/* Visibility Section */}
            <div className="absolute top-[2700px] mt-36 left-[444px] flex items-center">
              <div className="relative h-[265px]">
                <div className="absolute -top-px left-0 [font-family:'Figtree',Helvetica] font-normal text-black text-[19px] tracking-[5.32px] leading-[normal]">
                  VISIBILITY
                </div>

                <h2 className="absolute w-[581px] top-[42px] left-0.5 [font-family:'Figtree',Helvetica] font-bold text-[#1c1c1c] text-[52px] tracking-[0] leading-[normal]">
                  Stay ahead of your projects.
                </h2>

                <div className="absolute w-[578px] top-48 left-[5px] [font-family:'Figtree',Helvetica] text-[#434343] tracking-[0] leading-[normal]">
                  Quickly identify potential issues and their impact to schedule
                  and budgets. Avoid unwanted surprises with better project
                  visibility.
                  <br />
                  <br />
                  Project overview gives a complete picture of any outstanding
                  items.
                  <br />
                  <br />
                  Track all steps and speed up the approval process.
                </div>
                <div className="flex absolute w-[570px] top-80 gap-3 left-[5px]">
                  <button className="btn btn-primary">Request a Demo</button>
                  <button
                    onClick={handleInstallClick}
                    className="btn btn-neutral"
                  >
                    Get Mobile App
                  </button>
                </div>
              </div>
              <img
                src="mobile.jpeg"
                alt=""
                className="relative left-[670px] w-1/3 h-full"
              />
            </div>

            {/* Visibility Section */}
            <div className="absolute top-[3500px] w-[1600px] mt-36 left-[312px] px-20 flex items-center bg-accent">
              <div className="relative h-[270px]">
                <h2 className="absolute w-[581px] top-[42px] left-0.5 [font-family:'Figtree',Helvetica] font-bold text-white text-[52px] tracking-[0] leading-[normal]">
                  See how Project Management can work for your team.
                </h2>
                <div className="flex absolute w-[570px] top-64 gap-3 left-[5px]">
                  <button className="btn btn-primary">Request a Demo</button>
                </div>
              </div>
              <img
                src="footer_img.webp"
                alt=""
                className="relative left-[670px] w-1/2 h-full"
              />
            </div>

            {/* Stats Section */}
          </div>

          {/* Subtitle */}
          <div className="flex text-center justify-center">
            <div className="absolute top-[188px] [font-family:'Figtree',Helvetica] font-medium text-neutral-500 text-lg tracking-[4.84px] leading-[normal] whitespace-nowrap">
              CONSTRUCTION&nbsp;&nbsp;PROJECT&nbsp;&nbsp;MANAGEMENT&nbsp;&nbsp;SOFTWARE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
