import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');

  const handleNotifyMe = (e) => {
    e.preventDefault();
    if (notificationEmail) {
      alert(`Thank you! We'll notify you at ${notificationEmail} when courses are available.`);
      setNotificationEmail('');
    }
  };

  const handleEarlyAccess = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Great! We'll send early access information to ${email}.`);
      setEmail('');
    }
  };

  const features = [
    {
      icon: '📚',
      title: 'Comprehensive Curriculum',
      description: 'Master Java from basics to advanced concepts with our structured learning path'
    },
    {
      icon: '💻',
      title: 'Interactive Coding',
      description: 'Practice with real-time code execution and instant feedback'
    },
    {
      icon: '🏗️',
      title: 'Project-Based Learning',
      description: 'Build real-world projects and create an impressive portfolio'
    },
    {
      icon: '🚀',
      title: 'Hands-on Learning',
      description: 'Learn by building real projects with step-by-step guidance'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Senior Java Developer',
      company: 'TechCorp',
      content: 'This platform transformed my Java skills. The interactive approach made learning enjoyable and effective.'
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      company: 'StartupXYZ',
      content: 'The project-based approach helped me land my dream job. Highly recommended for serious learners.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Full Stack Developer',
      company: 'Digital Agency',
      content: 'Best Java learning experience I\'ve had. The interactive approach made complex concepts easy to understand.'
    }
  ];

  const instructors = [
    {
      name: 'Dr. James Wilson',
      title: 'Lead Java Instructor',
      experience: '15+ years',
      specialty: 'Enterprise Java Development',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20Java%20instructor%20headshot%2C%20middle-aged%20man%20with%20glasses%2C%20confident%20smile%2C%20professional%20attire%2C%20clean%20background%2C%20high-quality%20portrait&image_size=square'
    },
    {
      name: 'Maria Garcia',
      title: 'Senior Java Architect',
      experience: '12+ years',
      specialty: 'Microservices & Cloud',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20Java%20architect%20headshot%2C%20professional%20woman%2C%20confident%20expression%2C%20modern%20professional%20attire%2C%20clean%20background%2C%20high-quality%20portrait&image_size=square'
    }
  ];

  return (
    <div className="landing-page">
      {/* Standalone Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <img src="/vite.svg" alt="Java Learning Platform" className="nav-logo" />
            <span className="nav-title">Java Learning Platform</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#learning-path" className="nav-link">Learning Path</a>
            <a href="#testimonials" className="nav-link">Testimonials</a>
            <a href="#instructors" className="nav-link">Instructors</a>
            <Link to="/learn" className="nav-cta">Start Learning</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Master Java Programming with
              <span className="highlight"> Interactive Learning</span>
            </h1>
            <p className="hero-description">
              Join thousands of developers who transformed their careers through our comprehensive,
              project-based Java learning platform. From beginner to expert, we've got you covered.
            </p>
            <div className="hero-cta">
              <form onSubmit={handleEarlyAccess} className="email-form">
                <input
                  type="email"
                  placeholder="Enter your email for early access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="email-input"
                />
                <button type="submit" className="cta-button primary">
                  Get Early Access
                </button>
              </form>
              <Link to="/learn" className="cta-button secondary">
                Start Free Trial
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20Java%20learning%20platform%20hero%20image%2C%20code%20editor%20interface%2C%20Java%20code%20snippets%2C%20progress%20indicators%2C%20professional%20design%2C%20blue%20and%20orange%20color%20scheme%2C%20clean%20modern%20layout&image_size=landscape_16_9" 
              alt="Java Learning Platform"
              className="hero-visual"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Our Platform?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Banner */}
      <section className="coming-soon-section">
        <div className="container">
          <div className="coming-soon-content">
            <div className="coming-soon-text">
              <h2 className="coming-soon-title">Premium Courses Coming Soon!</h2>
              <p className="coming-soon-description">
                Get ready for our advanced Java courses with personalized mentorship,
                industry projects, and career placement assistance.
              </p>
              <ul className="course-benefits">
                <li>✅ 1-on-1 Mentorship Sessions</li>
                <li>✅ Real Industry Projects</li>
                <li>✅ Advanced Learning Paths</li>
                <li>✅ Expert Code Reviews</li>
                <li>✅ Lifetime Access & Updates</li>
              </ul>
              <div className="early-bird-notice">
                <span className="early-bird-badge">🎉 Early Bird Special</span>
                <p>50% off for first 100 registrants!</p>
              </div>
            </div>
            <div className="notification-form">
              <h3>Be the First to Know</h3>
              <form onSubmit={handleNotifyMe}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  required
                  className="notification-input"
                />
                <button type="submit" className="notify-button">
                  Notify Me When Available
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path Visualization */}
      <section id="learning-path" className="learning-path-section">
        <div className="container">
          <h2 className="section-title">Your Java Learning Journey</h2>
          <div className="learning-path">
            <div className="path-step">
              <div className="step-number">1</div>
              <h3>Java Fundamentals</h3>
              <p>Master variables, data types, control structures, and OOP concepts</p>
            </div>
            <div className="path-arrow">→</div>
            <div className="path-step">
              <div className="step-number">2</div>
              <h3>Advanced Concepts</h3>
              <p>Collections, generics, exception handling, and multithreading</p>
            </div>
            <div className="path-arrow">→</div>
            <div className="path-step">
              <div className="step-number">3</div>
              <h3>Frameworks & Tools</h3>
              <p>Spring Boot, Hibernate, Maven, and testing frameworks</p>
            </div>
            <div className="path-arrow">→</div>
            <div className="path-step">
              <div className="step-number">4</div>
              <h3>Real Projects</h3>
              <p>Build portfolio-worthy applications and deploy to production</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Students Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"{testimonial.content}"</p>
                  <div className="testimonial-author">
                    <h4 className="author-name">{testimonial.name}</h4>
                    <p className="author-role">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section id="instructors" className="instructors-section">
        <div className="container">
          <h2 className="section-title">Learn from Industry Experts</h2>
          <div className="instructors-grid">
            {instructors.map((instructor, index) => (
              <div key={index} className="instructor-card">
                <img 
                  src={instructor.image} 
                  alt={instructor.name}
                  className="instructor-image"
                />
                <div className="instructor-info">
                  <h3 className="instructor-name">{instructor.name}</h3>
                  <p className="instructor-title">{instructor.title}</p>
                  <p className="instructor-experience">{instructor.experience} experience</p>
                  <p className="instructor-specialty">{instructor.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Resources */}
      <section className="resources-section">
        <div className="container">
          <h2 className="section-title">Start Learning Today</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3>🎯 Practice Problems</h3>
              <p>Solve coding challenges and improve your problem-solving skills</p>
              <Link to="/practice/problems" className="resource-link">Start Practicing →</Link>
            </div>
            <div className="resource-card">
              <h3>📖 Learn Concepts</h3>
              <p>Interactive tutorials covering Java fundamentals to advanced topics</p>
              <Link to="/learn" className="resource-link">Start Learning →</Link>
            </div>
            <div className="resource-card">
              <h3>🚀 Project Tutorials</h3>
              <p>Step-by-step guides to build real Java applications</p>
              <Link to="/learn" className="resource-link">View Projects →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <div className="container">
          <div className="final-cta-content">
            <h2 className="final-cta-title">Ready to Transform Your Career?</h2>
            <p className="final-cta-description">
              Join thousands of developers who started their Java journey with us.
              Your path to becoming a Java expert begins here.
            </p>
            <div className="final-cta-buttons">
              <Link to="/learn" className="cta-button primary large">
                Start Free Trial
              </Link>
              <Link to="/practice/problems" className="cta-button secondary large">
                Try Practice Problems
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Java Learning Platform</h3>
              <p>Empowering developers with comprehensive Java education</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/learn">Learn</Link></li>
                <li><Link to="/practice/problems">Practice</Link></li>
                <li><Link to="/learn">Courses</Link></li>
                <li><Link to="/learn">Tutorials</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/community">Community</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <div className="social-links">
                <a href="#" aria-label="Twitter">🐦</a>
                <a href="#" aria-label="LinkedIn">💼</a>
                <a href="#" aria-label="GitHub">🐙</a>
                <a href="#" aria-label="Discord">💬</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Java Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;