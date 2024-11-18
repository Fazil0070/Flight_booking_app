import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { User, Booking, Flight } from './schemas.js';

const app = express();
const PORT = 6001;

// Middleware
app.use(express.json());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

// MongoDB Connection
mongoose
  .connect('mongodb://localhost:27017/flightApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');

    // API Routes

    // Register User
    app.post('/register', async (req, res) => {
      const { username, email, usertype, password } = req.body;
      let approval = 'approved';
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }

        if (usertype === 'flight-operator') {
          approval = 'not-approved';
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          username,
          email,
          usertype,
          password: hashedPassword,
          approval,
        });
        const userCreated = await newUser.save();
        return res.status(201).json(userCreated);
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server Error' });
      }
    });

    // Login User
    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        return res.json(user);
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server Error' });
      }
    });

    // Approve Flight Operator
    app.post('/approve-operator', async (req, res) => {
      const { id } = req.body;
      try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.approval = 'approved';
        await user.save();
        res.json({ message: 'Operator approved!' });
      } catch (err) {
        res.status(500).json({ message: 'Server Error' });
      }
    });

    // Reject Flight Operator
    app.post('/reject-operator', async (req, res) => {
      const { id } = req.body;
      try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.approval = 'rejected';
        await user.save();
        res.json({ message: 'Operator rejected!' });
      } catch (err) {
        res.status(500).json({ message: 'Server Error' });
      }
    });

    // Fetch Single User
    app.get('/fetch-user/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
      } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server Error' });
      }
    });

    // Fetch All Users
    app.get('/fetch-users', async (req, res) => {
      try {
        const users = await User.find();
        res.json(users);
      } catch (err) {
        res.status(500).json({ message: 'Error occurred' });
      }
    });

    // Add Flight
    app.post('/add-flight', async (req, res) => {
      const { flightName, flightId, origin, destination, departureTime, arrivalTime, basePrice, totalSeats } = req.body;
      try {
        const flight = new Flight({
          flightName,
          flightId,
          origin,
          destination,
          departureTime,
          arrivalTime,
          basePrice,
          totalSeats,
        });
        await flight.save();
        res.json({ message: 'Flight added successfully' });
      } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server Error' });
      }
    });

    // Update Flight
    app.put('/update-flight', async (req, res) => {
      const { _id, flightName, flightId, origin, destination, departureTime, arrivalTime, basePrice, totalSeats } = req.body;
      try {
        const flight = await Flight.findById(_id);
        if (!flight) return res.status(404).json({ message: 'Flight not found' });

        Object.assign(flight, { flightName, flightId, origin, destination, departureTime, arrivalTime, basePrice, totalSeats });
        await flight.save();
        res.json({ message: 'Flight updated successfully' });
      } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server Error' });
      }
    });

    // Fetch All Flights
    app.get('/fetch-flights', async (req, res) => {
      try {
        const flights = await Flight.find();
        res.json(flights);
      } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server Error' });
      }
    });

    // Fetch Single Flight
    app.get('/fetch-flight/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const flight = await Flight.findById(id);
        if (!flight) return res.status(404).json({ message: 'Flight not found' });

        res.json(flight);
      } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server Error' });
      }
    });

    // Book Ticket
    app.post('/book-ticket', async (req, res) => {
      const { user, flight, flightName, flightId, departure, destination, email, mobile, passengers, totalPrice, journeyDate, journeyTime, seatClass } = req.body;
      try {
        const bookings = await Booking.find({ flight, journeyDate, seatClass });
        const numBookedSeats = bookings.reduce((acc, booking) => acc + booking.passengers.length, 0);

        const seatCode = { economy: 'E', 'premium-economy': 'P', business: 'B', 'first-class': 'A' };
        const coach = seatCode[seatClass];
        const seats = Array.from({ length: passengers.length }, (_, i) => `${coach}-${numBookedSeats + i + 1}`).join(', ');

        const booking = new Booking({
          user,
          flight,
          flightName,
          flightId,
          departure,
          destination,
          email,
          mobile,
          passengers,
          totalPrice,
          journeyDate,
          journeyTime,
          seatClass,
          seats,
        });
        await booking.save();
        res.json({ message: 'Booking successful!' });
      } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server Error' });
      }
    });

    // Cancel Ticket
    app.put('/cancel-ticket/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.bookingStatus = 'cancelled';
        await booking.save();
        res.json({ message: 'Booking cancelled successfully' });
      } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server Error' });
      }
    });

    // Start Server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log(`Error connecting to MongoDB: ${error}`));
