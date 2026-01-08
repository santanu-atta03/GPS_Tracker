import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./landing.css";

function Feature({ title, desc, children }) {
  return (
    <div className="feature-card bg-white rounded-lg p-6 shadow-sm text-left">
      <div className="icon mb-4">{children}</div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function LikeButton() {
  const [liked, setLiked] = useState(false);
  return (
    <button
      aria-label="like"
      onClick={() => setLiked((s) => !s)}
      className={`like-btn ${liked ? "liked" : ""}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21s-7-4.35-9-6.35C1.4 12.9 2 9.5 4 7.8 6 6 8.5 6 10 7.6 11.5 6 14 6 16 7.8c2 1.7 2.6 5.1 1 7.85-2 2-9 6.35-9 6.35z"
          fill={"currentColor"}
        />
      </svg>
    </button>
  );
}

export default function Landing() {
  return (
    <div className="landing-root font-sans text-gray-900 relative overflow-hidden">
      <div className="bg-blob blob-1" aria-hidden></div>
      <div className="bg-blob blob-2" aria-hidden></div>
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="text-2xl font-bold">Where Is My Bus</div>
        <nav className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Link to="/home" className="text-gray-700 hover:text-green-700">
              Home
            </Link>
            <LikeButton />
          </div>
          <div className="flex items-center gap-2">
            <Link to="/Login/User" className="text-gray-700 hover:text-green-700">
              Sign in
            </Link>
            <LikeButton />
          </div>
        </nav>
      </header>

      <section className="hero container mx-auto px-6 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Never Miss Your Bus Again
          </h1>
          <p className="text-gray-700 mb-6 max-w-xl">
            Track buses in real-time, book tickets instantly, and travel smarter.
          </p>
          <div className="flex gap-4 items-center">
            <Link
              to="/home"
              className="btn-primary inline-flex items-center px-6 py-3 rounded shadow"
            >
              Start Tracking Now
            </Link>
            <button className="btn-secondary inline-flex items-center px-4 py-2 rounded">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                <path d="M5 12l14-8v16z" fill="#2563EB" />
              </svg>
              Watch Demo
            </button>
          </div>
        </div>

        <div className="hero-visual relative">
          <div className="glass-card">
            <svg viewBox="0 0 600 360" className="w-full rounded-lg shadow-lg">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="#60a5fa" />
                <stop offset="1" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" rx="12" fill="#f8fafc" />
            <g transform="translate(20,20)">
              <rect x="0" y="0" width="520" height="320" rx="8" fill="#fff" stroke="#e6eef5" />
              <circle cx="420" cy="80" r="26" fill="url(#g1)" />
              <text x="400" y="86" fontSize="12" fill="#fff">Bus</text>
              <path id="routePath" d="M60 240 C160 180, 280 180, 360 120" stroke="#60a5fa" strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>
          </svg>
            <div className="bus-icon" aria-hidden>
              <svg width="56" height="32" viewBox="0 0 64 36" className="bus-svg">
                <rect x="2" y="6" width="56" height="20" rx="4" fill="#10b981" />
                <circle cx="18" cy="28" r="3" fill="#111827" />
                <circle cx="46" cy="28" r="3" fill="#111827" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <h3 className="text-2xl font-semibold mb-6">Key Features</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            title="Smart Search"
            desc="Find buses by route, name, or ID instantly."
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.35-4.35" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" />
              <circle cx="11" cy="11" r="6" stroke="#0f766e" strokeWidth="2" />
            </svg>
          </Feature>
          <Feature
            title="Live Tracking"
            desc="See your bus approach on real real-time map."
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v6" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="14" r="6" stroke="#0f766e" strokeWidth="2" />
            </svg>
          </Feature>
          <Feature
            title="Easy Booking"
            desc="Select your seat and pay securely."
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="#0f766e" strokeWidth="2" />
              <path d="M7 10h10" stroke="#0f766e" strokeWidth="2" />
            </svg>
          </Feature>
        </div>
      </section>

      <section className="how container mx-auto px-6 py-12">
        <h3 className="text-2xl font-semibold mb-6">How It Works</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="step">
            <div className="step-icon">🔍</div>
            <div className="step-label">Search</div>
            <div className="step-badge badge-blue">Start</div>
          </div>
          <div className="step">
            <div className="step-icon">📍</div>
            <div className="step-label">Track</div>
            <div className="step-badge badge-green">Live</div>
          </div>
          <div className="step">
            <div className="step-icon">🪙</div>
            <div className="step-label">Book</div>
            <div className="step-badge badge-yellow">Pay</div>
          </div>
          <div className="step">
            <div className="step-icon">🚍</div>
            <div className="step-label">Travel</div>
            <div className="step-badge badge-pink">Go</div>
          </div>
        </div>
      </section>

      <section className="testimonials container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="cta-card p-6 rounded-lg bg-gradient-to-br from-sky-100 to-white">
            <h4 className="text-xl font-semibold mb-2">Ready to simplify the daily commute?</h4>
            <p className="text-gray-700 mb-4">Get started now and track buses in real time.</p>
            <Link to="/home" className="inline-block px-5 py-3 bg-orange-500 text-white rounded">Get Started Now</Link>
          </div>

          <div className="testimonial p-6 bg-white rounded-lg shadow">
            <div className="flex items-center gap-4 mb-3">
              <div className="avatar-svg">
                <svg viewBox="0 0 64 64" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="hairA" x1="0" x2="1"><stop offset="0" stopColor="#f59e0b"/><stop offset="1" stopColor="#ef4444"/></linearGradient>
                  </defs>
                  <circle cx="32" cy="32" r="30" fill="#eafff0"/>
                  <path d="M12 36c0-10 8-18 20-18s20 8 20 18v6H12v-6z" fill="url(#hairA)"/>
                  <circle cx="22" cy="30" r="3" fill="#111827"/>
                  <circle cx="42" cy="30" r="3" fill="#111827"/>
                  <path d="M24 42c2 2 8 2 10 0" stroke="#111827" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold">Alex</div>
                <div className="text-yellow-500">★★★★★</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">"This app changed my commute!"</p>
          </div>

          <div className="testimonial p-6 bg-white rounded-lg shadow">
            <div className="flex items-center gap-4 mb-3">
              <div className="avatar-svg">
                <svg viewBox="0 0 64 64" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="hairB" x1="0" x2="1"><stop offset="0" stopColor="#60a5fa"/><stop offset="1" stopColor="#34d399"/></linearGradient>
                  </defs>
                  <circle cx="32" cy="32" r="30" fill="#f0fdf4"/>
                  <path d="M12 36c0-10 8-18 20-18s20 8 20 18v6H12v-6z" fill="url(#hairB)"/>
                  <circle cx="22" cy="30" r="3" fill="#111827"/>
                  <circle cx="42" cy="30" r="3" fill="#111827"/>
                  <path d="M24 42c2 2 8 2 10 0" stroke="#111827" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold">Sam</div>
                <div className="text-yellow-500">★★★★★</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">"Reliable and easy to use."</p>
          </div>
        </div>
      </section>

      <footer className="py-8 bg-white border-t">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <div className="mb-4">About Us &nbsp;•&nbsp; Contact &nbsp;•&nbsp; Privacy &nbsp;•&nbsp; Policy</div>
          <div>© {new Date().getFullYear()} Where Is My Bus. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
