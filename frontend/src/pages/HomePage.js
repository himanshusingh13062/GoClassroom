const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Bootstrap CDN links */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossorigin="anonymous"
      ></link>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"
      ></script>

      {/* Custom styles */}
      <style>
        {`
          .hero-section {
            background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');
            background-size: cover;
            background-position: center;
            color: white;
          }
          .feature-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          .btn-primary {
            background-color: #4f46e5;
            border-color: #4f46e5;
          }
          .btn-primary:hover {
            background-color: #4338ca;
            border-color: #4338ca;
          }
          .btn-outline-light:hover {
            background-color: rgba(255,255,255,0.1);
          }
          .navbar {
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
        `}
      </style>

      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <span className="h4 mb-0 text-primary fw-bold">GradeTrack</span>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link fw-medium" href="/">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-medium" href="/">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-medium" href="/">
                  Pricing
                </a>
              </li>
              <li className="nav-item ms-lg-3">
                <a className="btn btn-primary rounded-pill px-4" href="/login">
                  Sign In
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section py-5 py-lg-6">
        <div className="container py-5">
          <div className="row align-items-center py-5">
            <div className="col-lg-7 text-center text-lg-start">
              <h1 className="display-4 fw-bold mb-4">Track Academic Progress with Confidence</h1>
              <p className="lead mb-4 opacity-90">
                Empower students and teachers with a seamless platform for monitoring grades, tracking performance, and
                achieving academic excellence.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <a href="/login" className="btn btn-primary btn-lg rounded-pill px-4">
                  Get Started
                </a>
                <a href="/" className="btn btn-outline-light btn-lg rounded-pill px-4">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="h1 fw-bold mb-4">Welcome to GradeTrack</h2>
              <p className="lead text-muted mb-5">
                GradeTrack is your smart companion for academic progress, bringing students and teachers closer through
                a simple, intuitive platform. Students can conveniently view their grades, monitor their performance
                over time, and stay informed about academic milestones. Teachers can easily record and update student
                grades, track class performance, and ensure transparency across the board.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-6 text-center">
              <h2 className="fw-bold mb-3">Why Choose GradeTrack?</h2>
              <p className="text-muted">
                Designed to promote clarity, efficiency, and engagement for a more connected educational environment.
              </p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm feature-card">
                <div className="card-body p-4 text-center">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#4f46e5"
                      className="bi bi-graph-up"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"
                      />
                    </svg>
                  </div>
                  <h4 className="card-title mb-3">Track Progress</h4>
                  <p className="card-text text-muted">
                    Monitor academic performance with intuitive visualizations and detailed analytics.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm feature-card">
                <div className="card-body p-4 text-center">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#4f46e5"
                      className="bi bi-people"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                    </svg>
                  </div>
                  <h4 className="card-title mb-3">Connect</h4>
                  <p className="card-text text-muted">
                    Bridge the gap between students and teachers with seamless communication tools.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm feature-card">
                <div className="card-body p-4 text-center">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="#4f46e5"
                      className="bi bi-shield-check"
                      viewBox="0 0 16 16"
                    >
                      <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
                      <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                    </svg>
                  </div>
                  <h4 className="card-title mb-3">Secure Access</h4>
                  <p className="card-text text-muted">
                    Protect sensitive academic data with our robust security infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card border-0 shadow-lg overflow-hidden">
                <div className="row g-0">
                  <div className="col-md-6">
                    <img
                      src="https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Student studying"
                      className="img-fluid h-100 object-fit-cover"
                    />
                  </div>
                  <div className="col-md-6 d-flex align-items-center">
                    <div className="card-body p-4 p-lg-5">
                      <h3 className="fw-bold mb-3">Effortless Access to Academic Success</h3>
                      <p className="text-muted mb-4">
                        GradeTrack empowers users with a secure and intuitive login system that serves as the gateway to
                        a personalized academic experience. With just a few clicks, students can explore their progress,
                        while teachers can efficiently manage classrooms and academic records.
                      </p>
                      <a href="/login" className="btn btn-primary rounded-pill px-4 py-2">
                        Get Started Today
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <h5 className="fw-bold mb-3">GradeTrack</h5>
              <p className="text-muted mb-0">Empowering academic excellence through innovative tracking solutions.</p>
            </div>
            <div className="col-lg-2 col-md-4">
              <h6 className="fw-bold mb-3">Quick Links</h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <a href="/" className="text-decoration-none text-muted">
                    Home
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/" className="text-decoration-none text-muted">
                    Features
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/" className="text-decoration-none text-muted">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-4">
              <h6 className="fw-bold mb-3">Resources</h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <a href="/" className="text-decoration-none text-muted">
                    Blog
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/" className="text-decoration-none text-muted">
                    Support
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/" className="text-decoration-none text-muted">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-4">
              <h6 className="fw-bold mb-3">Contact</h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2 text-muted">Email: support@gradetrack.com</li>
                <li className="mb-2 text-muted">Phone: +1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <hr className="my-4 opacity-25" />
          <div className="text-center">
            <p className="mb-0 text-muted">&copy; 2025 Himanshu Singh. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
