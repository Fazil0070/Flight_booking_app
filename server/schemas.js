import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    usertype: { type: String, required: true }, // Example: 'customer' or 'flight-operator'
    password: { type: String, required: true },
    approval: { type: String, enum: ['approved', 'not-approved', 'rejected'], default: 'approved' }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const flightSchema = new mongoose.Schema({
    flightName: { type: String, required: true },
    flightId: { type: String, required: true, unique: true }, // Assuming flight IDs are unique
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: String, required: true }, // Can be converted to Date for better accuracy
    arrivalTime: { type: String, required: true }, // Can be converted to Date
    basePrice: { type: Number, required: true },
    totalSeats: { type: Number, required: true }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    flightName: { type: String, required: true },
    flightId: { type: String, required: true },
    departure: { type: String, required: true },
    destination: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    seats: { type: String }, // Example: "E-1, E-2, E-3"
    passengers: [{
        name: { type: String, required: true },
        age: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    bookingDate: { type: Date, default: Date.now },
    journeyDate: { type: Date, required: true },
    journeyTime: { type: String, required: true },
    seatClass: { type: String, enum: ['economy', 'premium-economy', 'business', 'first-class'], required: true },
    bookingStatus: { type: String, enum: ['confirmed', 'cancelled'], default: "confirmed" }
}, { timestamps: true });

export const User = mongoose.model('users', userSchema);
export const Flight = mongoose.model('Flight', flightSchema);
export const Booking = mongoose.model('Booking', bookingSchema);
