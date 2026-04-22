const PUBLIC_DEMO_CHECKOUT_MESSAGE = 'Ticket checkout is disabled on this public demo. Use local development for booking and payments.'

export const getCheckoutBlockReason = ({ authFeaturesEnabled, user, selectedTime, selectedSeats }) => {
  if (!authFeaturesEnabled) {
    return PUBLIC_DEMO_CHECKOUT_MESSAGE
  }

  if (!user) {
    return 'Please login to proceed'
  }

  if (!selectedTime || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
    return 'Please select a time and seats'
  }

  return null
}

export { PUBLIC_DEMO_CHECKOUT_MESSAGE }
