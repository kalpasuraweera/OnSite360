import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mx-auto px-4">
      {/* Navbar */}
      <nav className="navbar bg-base-100 shadow-lg mb-4">
        <div className="flex-1">
          <Link to="/" className="text-xl font-bold">
            OnSite360
          </Link>
        </div>
        <div className="flex-none">
          <label className="swap swap-rotate">
            {/* this hidden checkbox controls the state */}
            <input
              type="checkbox"
              className="theme-controller"
              value="bumblebee"
            />

            {/* sun icon */}
            <svg
              className="swap-off h-10 w-10 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>

            {/* moon icon */}
            <svg
              className="swap-on h-10 w-10 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero bg-base-200 py-16">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="text-center lg:text-left lg:w-1/2">
            <h1 className="text-5xl font-bold">Welcome to OnSite360</h1>
            <p className="py-6">
              Your complete solution for construction site management and
              monitoring
            </p>
            <div>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2">
            <img
              src="/images/construction-site.jpg"
              alt="Construction site overview"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-4xl font-bold text-center mb-8">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card bg-base-100 shadow-lg p-6">
            <h3 className="text-xl font-bold">Real-time Monitoring</h3>
            <p className="mt-2">
              Track your construction progress with live updates and
              notifications
            </p>
          </div>
          <div className="card bg-base-100 shadow-lg p-6">
            <h3 className="text-xl font-bold">Safety Compliance</h3>
            <p className="mt-2">
              Ensure site safety with automated compliance checks and reporting
            </p>
          </div>
          <div className="card bg-base-100 shadow-lg p-6">
            <h3 className="text-xl font-bold">Resource Management</h3>
            <p className="mt-2">
              Optimize equipment and personnel allocation across your projects
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-base-200">
        <h2 className="text-4xl font-bold text-center mb-8">
          What Our Clients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card bg-base-100 shadow-lg p-6">
            <p className="italic">
              "OnSite360 has revolutionized how we manage our construction
              projects."
            </p>
            <h4 className="mt-4 font-bold">- John Doe, Project Manager</h4>
          </div>
          <div className="card bg-base-100 shadow-lg p-6">
            <p className="italic">
              "The real-time insights have helped us prevent costly delays and
              improve efficiency."
            </p>
            <h4 className="mt-4 font-bold">
              - Jane Smith, Construction Director
            </h4>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to transform your construction management?
        </h2>
        <button className="btn btn-primary btn-lg">Schedule a Demo</button>
      </section>
    </div>
  );
};

export default Home;
