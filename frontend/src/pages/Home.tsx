

const Home = () => {

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to OnSite360</h1>
          <p>Your complete solution for construction site management and monitoring</p>
          <button className="cta-button">Get Started</button>
        </div>
        <div className="hero-image">
          <img src="/images/construction-site.jpg" alt="Construction site overview" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Our Features</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Real-time Monitoring</h3>
            <p>Track your construction progress with live updates and notifications</p>
          </div>
          <div className="feature-card">
            <h3>Safety Compliance</h3>
            <p>Ensure site safety with automated compliance checks and reporting</p>
          </div>
          <div className="feature-card">
            <h3>Resource Management</h3>
            <p>Optimize equipment and personnel allocation across your projects</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Our Clients Say</h2>
        <div className="testimonials">
          <div className="testimonial">
            <p>"OnSite360 has revolutionized how we manage our construction projects."</p>
            <h4>- John Doe, Project Manager</h4>
          </div>
          <div className="testimonial">
            <p>"The real-time insights have helped us prevent costly delays and improve efficiency."</p>
            <h4>- Jane Smith, Construction Director</h4>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>Ready to transform your construction management?</h2>
        <button className="cta-button large">Schedule a Demo</button>
      </section>
    </div>
  );
};

export default Home;
