import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="logo"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
        <span className="brand">BreatheFree</span>
      </div>

      <ul className="navbar-menu">
        <li>
          <a href="#">Dashboard</a>
        </li>
        <li>
          <a href="#">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon"
            >
              <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path>
              <path d="M16 2v4"></path>
              <path d="M8 2v4"></path>
              <path d="M3 10h5"></path>
              <path d="M17.5 17.5 16 16.3V14"></path>
              <circle cx="16" cy="16" r="6"></circle>
            </svg>
            Plan
          </a>
        </li>
        <li>
          <Link to="/Tracking">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon"
            >
              <path d="M18 12H2v4h16"></path>
              <path d="M22 12v4"></path>
              <path d="M7 12v4"></path>
              <path d="M18 8c0-2.5-2-2.5-2-5"></path>
              <path d="M22 8c0-2.5-2-2.5-2-5"></path>
            </svg>
            Tracking
          </Link>
        </li>
        <li>
          <a href="#">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
            Leaderboard
          </a>
        </li>
        <li>
          <a href="#">Blog</a>
        </li>
      </ul>

      <div className="navbar-right">
        <button className="btn-outline">Log In</button>
        <button className="btn-solid">Sign Up</button>
      </div>
    </nav>
  );
};

export default Header;
