import Address from '../models/addressModel.js';
import User from '../models/User.js';

// Get all addresses of logged-in user
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Add a new address
export const addAddress = async (req, res) => {
  try {
    // If it's default, unset existing default addresses
    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );
    }

    const address = new Address({
      ...req.body,
      user: req.user._id,
    });

    await address.save();

    // Optional: Push to user's address array
  // Optional: update user's addresses only if it exists in schema
try {
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { addresses: address._id },
  });
} catch (err) {
  console.warn("User update skipped (no addresses field in schema).");
}


    res.status(201).json(address);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update an existing address
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.addressId, user: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    // If new address is default, unset previous ones
    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );
    }

    Object.assign(address, req.body);
    await address.save();

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete an address
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.addressId, user: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    // Optional: Remove from user's array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: req.params.addressId }
    });

    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// Set a specific address as default
export const setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;

    // Check if address exists and belongs to the user
    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    // Unset current default addresses
    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.json({ message: 'Default address set successfully', address });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// controllers/geoController.js
// controllers/geoController.js
export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    const response = await fetch(url, {
      headers: { "User-Agent": "YourAppName/1.0" },
    });
    const data = await response.json();
    const a = data?.address || {};

    const mapped = {
      label: "Home,Work,Other",
      addressLine1: [a.house_number, a.road].filter(Boolean).join(" ") || data?.display_name || "",
      addressLine2: [a.suburb, a.neighbourhood, a.county].filter(Boolean).join(", "),
      city: a.city || a.town || a.village || "",
      state: a.state || "",
      postalCode: a.postcode || "",
      country: a.country || "",
      latitude: Number(lat),
      longitude: Number(lng),
    };

    res.json(mapped);
  } catch (err) {
    console.error("Reverse geocode error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

