import React from "react";

const HomePage = () => {
  return (
    <div classNameName="container text-center mt-5">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous"></link>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>



      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">GradeTrack</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
          </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link active" aria-current="page" href="/">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/">Features</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/">Pricing</a>
                </li>
              </ul>
            </div>
        </div>
      </nav>



      <div className="container">
        <h1>Welcome to the GradeTrack</h1>

        <p>
        GradeTrack is your smart companion for academic progress, bringing students and teachers closer through a simple, intuitive platform. Students can conveniently view their grades, monitor their performance over time, and stay informed about academic milestones. Teachers can easily record and update student grades, track class performance, and ensure transparency across the board. Designed to promote clarity, efficiency, and engagement, GradeTrack encourages a more connected educational environment. Whether you’re striving to reach your academic goals or supporting others on their journey, GradeTrack makes progress easy to see and success easier to achieve. 
        </p>
      </div>

      <div className="container">
        <div class="card">
          <div class="card-header">
            Featured
          </div>
          <div class="card-body">
            <h5 class="card-title">New Here</h5>
            <p class="card-text">Join GradeTrack today and take control of your academic journey with ease and confidence!</p>
            <a href="/login" class="btn btn-primary">Sign up</a>
          </div>
        </div>
      </div>





<div className="container mt-5">
      <div className="row align-items-center">
        {/* Text Section */}
        <div className="col-md-6">
          <h1>Effortless Access to Academic Success</h1>
          <p>
          GradeTrack empowers users with a secure and intuitive login system that serves as the gateway to a personalized academic experience. With just a few clicks, students can explore their progress, while teachers can efficiently manage classrooms and academic records. The platform's sleek design ensures easy navigation, making every login the first step toward productivity and achievement. Designed for speed, simplicity, and reliability, GradeTrack makes logging in feel like a seamless part of your academic routine.
          </p>
          <a className="btn btn-primary" href="/login" role="button">Login</a>
        </div>
        
        {/* Image Section */}
        <div className="col-md-6 text-center">
          <img src="https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Student" className="img-fluid rounded shadow" />
        </div>
      </div>

    </div>

    <footer className="bg-dark text-light text-center py-3 mt-5">
        <p>&copy; 2025 Himanshu Singh. All rights reserved.</p>
    </footer>

    </div>
  );
};

export default HomePage;
