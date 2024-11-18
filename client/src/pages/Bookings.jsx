import React, { useEffect, useState } from 'react';
import '../styles/Bookings.css';
import axios from 'axios';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:6001/fetch-bookings');
      const fetchedBookings = response.data;
      setBookings(fetchedBookings.length ? fetchedBookings.reverse() : getDefaultBookings());
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings(getDefaultBookings());
    }
  };

  const cancelTicket = async (id) => {
    try {
      await axios.put(`http://localhost:6001/cancel-ticket/${id}`);
      alert('Ticket cancelled!');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling ticket:', error);
    }
  };

  const getDefaultBookings = () => [
    {
      _id: 'default1',
      user: userId,
      mobile: '1234567890',
      email: 'user@example.com',
      flightId: 'FL001',
      flightName: 'Skyline Airways',
      departure: 'New York',
      destination: 'Los Angeles',
      passengers: [
        { name: 'John Doe', age: 30 },
        { name: 'Jane Doe', age: 28 },
      ],
      seats: '12A, 12B',
      bookingDate: new Date().toISOString(),
      journeyDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      journeyTime: '10:00 AM',
      totalPrice: 350,
      bookingStatus: 'confirmed',
    },
    {
      _id: 'default2',
      user: userId,
      mobile: '9876543210',
      email: 'anotheruser@example.com',
      flightId: 'FL002',
      flightName: 'Eagle Air',
      departure: 'San Francisco',
      destination: 'Chicago',
      passengers: [{ name: 'Alice Smith', age: 25 }],
      seats: '14C',
      bookingDate: new Date().toISOString(),
      journeyDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
      journeyTime: '1:00 PM',
      totalPrice: 220,
      bookingStatus: 'confirmed',
    },
  ];

  return (
    <div className="user-bookingsPage">
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Your Bookings</h1>

      <div className="user-bookings">
        {bookings
          .filter((booking) => booking.user === userId)
          .map((booking) => (
            <div className="user-booking card" key={booking._id}>
              <h3 className="card-title">{booking.flightName}</h3>
              <p>
                <b>Booking ID:</b> {booking._id}
              </p>
              <div className="details">
                <p>
                  <b>Mobile:</b> {booking.mobile}
                </p>
                <p>
                  <b>Email:</b> {booking.email}
                </p>
              </div>
              <div className="details">
                <p>
                  <b>From:</b> {booking.departure}
                </p>
                <p>
                  <b>To:</b> {booking.destination}
                </p>
              </div>
              <div className="details">
                <p>
                  <b>Journey Date:</b> {booking.journeyDate.slice(0, 10)}
                </p>
                <p>
                  <b>Journey Time:</b> {booking.journeyTime}
                </p>
              </div>
              <div className="details">
                <p>
                  <b>Total Price:</b> ${booking.totalPrice}
                </p>
                <p
                  style={{
                    color: booking.bookingStatus === 'cancelled' ? 'red' : 'green',
                  }}
                >
                  <b>Status:</b> {booking.bookingStatus}
                </p>
              </div>
              <div>
                <b>Passengers:</b>
                <ul>
                  {booking.passengers.map((passenger, index) => (
                    <li key={index}>
                      {passenger.name} (Age: {passenger.age})
                    </li>
                  ))}
                </ul>
              </div>
              {booking.bookingStatus === 'confirmed' && (
                <button
                  className="btn btn-danger"
                  style={{
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    cursor: 'pointer',
                  }}
                  onClick={() => cancelTicket(booking._id)}
                >
                  Cancel Ticket
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Bookings;

