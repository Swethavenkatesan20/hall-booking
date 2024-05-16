// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Room = require('./models/Room');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb+srv://swethavenkatesan20:swethavenkat99@cluster0.v4m62io.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// creating Room
app.post('/api/rooms', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).send(room);
  } catch (error) {
    res.status(400).send(error);
  }
});

// booking Room
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).send(booking);
  } catch (error) {
    res.status(400).send(error);
  }
});

//  all rooms with booked data
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    const bookings = await Booking.find().populate('roomId');
    const roomsWithBookings = rooms.map(room => {
      const roomBookings = bookings.filter(booking => booking.roomId._id.equals(room._id));
      return {
        ...room._doc,
        bookings: roomBookings.map(booking => ({
          customerName: booking.customerName,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
        }))
      };
    });
    res.send(roomsWithBookings);
  } catch (error) {
    res.status(400).send(error);
  }
});

//  all customers with booked data
app.get('/api/customers', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('roomId');
    const customers = bookings.map(booking => ({
      customerName: booking.customerName,
      roomName: booking.roomId.name,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingId: booking._id,
      bookingDate: booking.bookingDate,
    }));
    res.send(customers);
  } catch (error) {
    res.status(400).send(error);
  }
});

// no. of times a customer has booked a room
app.get('/api/customers/:customerName/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ customerName: req.params.customerName }).populate('roomId');
    const customerBookings = bookings.map(booking => ({
      roomName: booking.roomId.name,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingId: booking._id,
      bookingDate: booking.bookingDate,
    }));
    res.send({
      customerName: req.params.customerName,
      bookings: customerBookings,
      totalBookings: customerBookings.length
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
