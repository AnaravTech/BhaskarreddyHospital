import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  HeartPulse,
  MapPin,
  Menu,
  PhoneCall,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { useWebsite } from "../context/WebsiteContext";

type Section = "home" | "doctors" | "departments" | "wellness" | "contact";

export const PublicWebsite: React.FC = () => {
  const {
    doctors,
    departments,
    blogPosts,
    testimonials,
    addAppointment,
    addContactInquiry,
    addToast,
    setActiveView,
  } = useWebsite();
  const [section, setSection] = useState<Section>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]);
  const [query, setQuery] = useState("");
  const [booking, setBooking] = useState({
    name: "",
    phone: "",
    date: "",
    time: "10:00 AM",
  });
  const [contact, setContact] = useState({ name: "", phone: "", message: "" });
  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doctor) =>
        `${doctor.name} ${doctor.specialization} ${doctor.departmentName}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [doctors, query],
  );
  const goTo = (next: Section) => {
    setSection(next);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openBooking = (doctor = doctors[0]) => {
    setSelectedDoctor(doctor);
    setBookingOpen(true);
  };
  const updateBooking = (key: keyof typeof booking, value: string) =>
    setBooking({ ...booking, [key]: value });
  const updateContact = (key: keyof typeof contact, value: string) =>
    setContact({ ...contact, [key]: value });
  const submitBooking = (event: React.FormEvent) => {
    event.preventDefault();
    if (!booking.name || !booking.phone) {
      addToast(
        "A little more is needed",
        "Please add your name and phone number so we can call you.",
        "warning",
      );
      return;
    }
    addAppointment({
      patientName: booking.name,
      patientPhone: booking.phone,
      patientAge: 35,
      patientGender: "Not specified",
      doctorName: selectedDoctor.name,
      departmentName: selectedDoctor.departmentName,
      appointmentDate: booking.date || "2026-07-25",
      appointmentTime: booking.time,
      model: "Normal Queue",
      fee: selectedDoctor.consultationFee,
    });
    setBookingOpen(false);
    setBooking({ name: "", phone: "", date: "", time: "10:00 AM" });
  };
  const submitContact = (event: React.FormEvent) => {
    event.preventDefault();
    if (!contact.name || !contact.phone) return;
    addContactInquiry({
      name: contact.name,
      phone: contact.phone,
      email: "",
      subject: "Website callback request",
      message: contact.message || "Please call me back.",
    });
    setContact({ name: "", phone: "", message: "" });
  };
  const navItems: { id: Section; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "doctors", label: "Find a doctor" },
    { id: "departments", label: "Our care" },
    { id: "wellness", label: "Wellness journal" },
    { id: "contact", label: "Visit us" },
  ];

  return (
    <div className="care-site">
      <div className="notice-bar">
        <ShieldCheck size={15} />
        <span>Your privacy and comfort matter to us.</span>
        <a href="tel:040-23456789">Emergency: 040-23456789</a>
      </div>
      <header className="site-header">
        <button
          className="brand"
          onClick={() => goTo("home")}
          aria-label="Bhaskar Reddy Hospital home"
        >
          <span className="brand-mark">
            <HeartPulse size={25} />
          </span>
          <span>
            <strong>Bhaskar Reddy</strong>
            <em>Hospital</em>
          </span>
        </button>
        <button
          className="menu-button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Open menu"
        >
          <Menu />
        </button>
        <nav className={mobileOpen ? "main-nav open" : "main-nav"}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={section === item.id ? "active" : ""}
              onClick={() => goTo(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button
            className="admin-link"
            onClick={() => setActiveView("website-cms")}
          >
            Staff login
          </button>
        </nav>
        <button
          className="button button-primary header-book"
          onClick={() => openBooking()}
        >
          <CalendarDays size={17} /> Book a visit
        </button>
      </header>

      {section === "home" && (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-dot" /> Care that feels human
              </p>
              <h1>
                Better health begins with <span>being heard.</span>
              </h1>
              <p className="hero-intro">
                Thoughtful doctors, modern medicine, and a team that stays
                beside you through every step of healing.
              </p>
              <div className="hero-actions">
                <button
                  className="button button-primary"
                  onClick={() => openBooking()}
                >
                  Find your care <ArrowRight size={17} />
                </button>
                <button className="text-button" onClick={() => goTo("doctors")}>
                  Meet our doctors <ArrowRight size={16} />
                </button>
              </div>
              <div className="trust-line">
                <div className="avatar-stack">
                  <span>V</span>
                  <span>A</span>
                  <span>R</span>
                </div>
                <span>
                  <strong>250,000+</strong> families cared for, with heart
                </span>
              </div>
            </div>
            <div className="hero-art">
              <div className="sun-disc" />
              <div className="leaf leaf-one" />
              <div className="leaf leaf-two" />
              <div className="person person-one">
                <span className="head" />
                <span className="body" />
              </div>
              <div className="person person-two">
                <span className="head" />
                <span className="body" />
              </div>
              <div className="heart-doodle">♡</div>
              <div className="care-note">
                <HeartPulse size={18} />
                <span>
                  <strong>Here for you</strong>
                  <small>24 hours, every day</small>
                </span>
              </div>
            </div>
          </section>
          <section className="quick-care">
            <div className="quick-heading">
              <span className="section-kicker">Start here</span>
              <h2>What can we help with?</h2>
              <p>Simple next steps, whenever you need them.</p>
            </div>
            <button onClick={() => openBooking()}>
              <CalendarDays />
              <span>
                <strong>Book an appointment</strong>
                <small>Choose a doctor and time</small>
              </span>
              <ArrowRight />
            </button>
            <button onClick={() => goTo("doctors")}>
              <Stethoscope />
              <span>
                <strong>Find a specialist</strong>
                <small>Meet the right doctor for you</small>
              </span>
              <ArrowRight />
            </button>
            <a href="tel:040-23456789" className="urgent">
              <PhoneCall />
              <span>
                <strong>Need help now?</strong>
                <small>Call our 24/7 care line</small>
              </span>
              <ArrowRight />
            </a>
          </section>
          <section className="content-section welcome-grid">
            <div>
              <p className="section-kicker">A little more human</p>
              <h2>
                Good care is clinical.
                <br />
                <i>Great care is personal.</i>
              </h2>
            </div>
            <div className="welcome-copy">
              <p>
                At Bhaskar Reddy Hospital, we believe a hospital should feel
                less like a building and more like a place where people look
                after people.
              </p>
              <p>
                From your first hello at reception to the moment you return
                home, our specialists and support teams make space for your
                questions, your family, and your peace of mind.
              </p>
              <button
                className="text-button"
                onClick={() => goTo("departments")}
              >
                Explore our care <ArrowRight size={16} />
              </button>
            </div>
          </section>
          <section className="content-section specialty-section">
            <div className="section-head">
              <div>
                <p className="section-kicker">Care, thoughtfully arranged</p>
                <h2>Specialties for every chapter.</h2>
              </div>
              <button
                className="text-button"
                onClick={() => goTo("departments")}
              >
                View all care <ArrowRight size={16} />
              </button>
            </div>
            <div className="specialty-grid">
              {departments.map((department, index) => (
                <button
                  className={`specialty-card card-${index}`}
                  key={department.id}
                  onClick={() => {
                    goTo("doctors");
                    setQuery(department.name);
                  }}
                >
                  <span className="specialty-icon">
                    {index === 0 ? "♡" : index === 1 ? "◌" : "✦"}
                  </span>
                  <h3>{department.name}</h3>
                  <p>{department.description}</p>
                  <span className="card-link">
                    Meet the team <ArrowRight size={15} />
                  </span>
                </button>
              ))}
            </div>
          </section>
          {testimonials[0] && (
            <section className="story-band">
              <div className="story-quote">“</div>
              <div>
                <p className="section-kicker">A patient story</p>
                <blockquote>{testimonials[0].reviewText}</blockquote>
                <p className="story-person">
                  <strong>{testimonials[0].patientName}</strong> ·{" "}
                  {testimonials[0].treatment}
                </p>
              </div>
              <div className="story-seal">
                <HeartPulse size={28} />
                <span>
                  Care you
                  <br />
                  can feel
                </span>
              </div>
            </section>
          )}
          <section className="content-section journal-preview">
            <div className="section-head">
              <div>
                <p className="section-kicker">From our wellness journal</p>
                <h2>Small things. Better days.</h2>
              </div>
              <button className="text-button" onClick={() => goTo("wellness")}>
                Read the journal <ArrowRight size={16} />
              </button>
            </div>
            <div className="journal-grid">
              {blogPosts.slice(0, 3).map((post) => (
                <article key={post.id}>
                  <div
                    className="journal-image"
                    style={{ backgroundImage: `url(${post.image})` }}
                  />
                  <p className="journal-category">
                    {post.category} · {post.date}
                  </p>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <button className="text-button">
                    Read more <ArrowRight size={14} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}
      {section === "doctors" && (
        <Page
          title="The right doctor changes everything."
          intro="Search our team of experienced specialists and take the next step with someone who listens."
          kicker="Meet your care team"
        >
          <div className="search-field">
            <Search size={19} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by doctor, specialty, or concern"
            />
            <X size={17} onClick={() => setQuery("")} />
          </div>
          <div className="doctor-grid">
            {filteredDoctors.map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <img src={doctor.image} alt={doctor.name} />
                <div className="doctor-info">
                  <span className="doctor-rating">★ {doctor.rating}</span>
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialization}</p>
                  <small>
                    {doctor.qualification} · {doctor.experienceYears} years
                    experience
                  </small>
                  <button
                    className="button button-primary"
                    onClick={() => openBooking(doctor)}
                  >
                    Book with {doctor.name.split(" ").slice(-1)[0]}{" "}
                    <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Page>
      )}
      {section === "departments" && (
        <Page
          title="Care, all under one roof."
          intro="From prevention to recovery, our teams work together around what matters most: you."
          kicker="Our care"
        >
          <div className="department-list">
            {departments.map((department, index) => (
              <article key={department.id}>
                <div className="department-number">0{index + 1}</div>
                <div>
                  <p className="section-kicker">{department.code}</p>
                  <h2>{department.name}</h2>
                  <p>{department.description}</p>
                  <div className="service-list">
                    {department.services.map((service) => (
                      <span key={service}>
                        <Check size={14} /> {service}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  className="round-arrow"
                  onClick={() => {
                    goTo("doctors");
                    setQuery(department.name);
                  }}
                >
                  <ArrowRight />
                </button>
              </article>
            ))}
          </div>
        </Page>
      )}
      {section === "wellness" && (
        <Page
          title="A healthier day, one note at a time."
          intro="Clear, kind guidance from our doctors to help you care for yourself and the people you love."
          kicker="Wellness journal"
        >
          <div className="journal-grid full-journal">
            {blogPosts.map((post) => (
              <article key={post.id}>
                <div
                  className="journal-image"
                  style={{ backgroundImage: `url(${post.image})` }}
                />
                <p className="journal-category">
                  {post.category} · {post.date}
                </p>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <button className="text-button">
                  Read article <ArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </Page>
      )}
      {section === "contact" && (
        <Page
          title="Come as you are. We are here."
          intro="Find us, call us, or leave your number. A member of our care team will help you find the way forward."
          kicker="Visit Bhaskar Reddy Hospital"
        >
          <div className="visit-grid">
            <div className="visit-card">
              <MapPin size={25} />
              <h2>Find us</h2>
              <p>
                Bhaskar Reddy Hospital
                <br />
                Hyderabad, Telangana
              </p>
              <span>Open every day · 24-hour emergency care</span>
              <a className="text-button" href="tel:040-23456789">
                Get directions <ArrowRight size={15} />
              </a>
            </div>
            <form className="callback-form" onSubmit={submitContact}>
              <p className="section-kicker">We can call you</p>
              <h2>Questions are welcome.</h2>
              <input
                placeholder="Your name"
                value={contact.name}
                onChange={(event) => updateContact("name", event.target.value)}
              />
              <input
                placeholder="Phone number"
                value={contact.phone}
                onChange={(event) => updateContact("phone", event.target.value)}
              />
              <textarea
                placeholder="How can we help?"
                value={contact.message}
                onChange={(event) =>
                  updateContact("message", event.target.value)
                }
              />
              <button className="button button-primary">
                Request a callback <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </Page>
      )}
      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark">
            <HeartPulse size={22} />
          </span>
          <div>
            <strong>Bhaskar Reddy Hospital</strong>
            <p>Care that feels human.</p>
          </div>
        </div>
        <div>
          <p>24/7 care line</p>
          <a href="tel:040-23456789">040-23456789</a>
        </div>
        <div>
          <p>For appointments</p>
          <a href="mailto:care@bhaskarreddyhospital.com">
            care@bhaskarreddyhospital.com
          </a>
        </div>
        <p className="footer-note">
          © 2026 Bhaskar Reddy Hospital
          <br />
          Here for every heartbeat.
        </p>
      </footer>
      <div className="floating-emergency">
        <PhoneCall size={17} />
        <a href="tel:040-23456789">Emergency help</a>
      </div>
      {bookingOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setBookingOpen(false);
          }}
        >
          <form className="booking-modal" onSubmit={submitBooking}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setBookingOpen(false)}
              aria-label="Close"
            >
              <X />
            </button>
            <p className="section-kicker">A simple first step</p>
            <h2>Book a visit with care.</h2>
            <p className="modal-intro">
              We will confirm your appointment by phone. No pressure, no
              confusing forms.
            </p>
            <label>
              Your name
              <input
                value={booking.name}
                onChange={(event) => updateBooking("name", event.target.value)}
                required
              />
            </label>
            <label>
              Phone number
              <input
                value={booking.phone}
                onChange={(event) => updateBooking("phone", event.target.value)}
                required
              />
            </label>
            <div className="form-row">
              <label>
                Preferred date
                <input
                  type="date"
                  value={booking.date}
                  onChange={(event) =>
                    updateBooking("date", event.target.value)
                  }
                />
              </label>
              <label>
                Preferred time
                <select
                  value={booking.time}
                  onChange={(event) =>
                    updateBooking("time", event.target.value)
                  }
                >
                  <option>10:00 AM</option>
                  <option>12:30 PM</option>
                  <option>03:00 PM</option>
                  <option>05:30 PM</option>
                </select>
              </label>
            </div>
            <div className="chosen-doctor">
              <img src={selectedDoctor.image} alt="" />
              <span>
                <small>Requesting an appointment with</small>
                <strong>{selectedDoctor.name}</strong>
              </span>
              <ChevronDown size={16} />
            </div>
            <button className="button button-primary full-button">
              Request appointment <ArrowRight size={17} />
            </button>
            <p className="modal-footnote">
              <Clock3 size={14} /> Our team responds within one working hour.
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

const Page: React.FC<{
  title: string;
  intro: string;
  kicker: string;
  children: React.ReactNode;
}> = ({ title, intro, kicker, children }) => (
  <main className="inner-page">
    <section className="page-heading">
      <p className="eyebrow">
        <span className="eyebrow-dot" /> {kicker}
      </p>
      <h1>{title}</h1>
      <p>{intro}</p>
    </section>
    <section className="page-content">{children}</section>
  </main>
);
