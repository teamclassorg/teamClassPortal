import { gql } from '@apollo/client';

export default gql`
  query GetBookingAndCalendarEvent($bookingId: String!) {
    calendarEvent(query: { bookingId: $bookingId }) {
      _id
      classId
      bookingId
      status
      toHour
      toMinutes
      year
      day
      fromHour
      fromMinutes
      month
      rushFee
    }
    booking(query: { _id: $bookingId }) {
      _id
      date
      expirationHours
      teamClassId
      eventCoordinatorId
      hasInternationalAttendees
      classVariant {
        title
        notes
        minimum
        maximum
        duration
        pricePerson
        hasKit
        order
        active
        groupEvent
        kitHasAlcohol
      }
      notes {
        note
        author
        date
      }
      addons {
        icon
        color
        name
        description
        multipleUnits
        unitPrice
        unit
        order
        active
      }
      payments {
        addressLine1
        addressLine2
        amount
        cardBrand
        cardExpMonth
        cardExpYear
        cardLast4
        cardFunding
        cardCountry
        chargeUrl
        city
        country
        createdAt
        email
        livemode
        name
        paymentId
        paymentName
        paymentMethod
        phone
        state
        status
      }
      instructorId
      instructorName
      customerId
      customerName
      eventDate
      eventDurationHours
      attendees
      classMinimum
      pricePerson
      serviceFee
      rushFee
      salesTax
      salesTaxState
      discount
      status
      closedReason
      eventLink
      signUpStatusLink
      checkoutLink
      taxExempt
      ccFeeExempt
      capRegistration
      invoiceDetails {
        item
        unitPrice
        units
        priceEditable
        unitsEditable
        taxable
        readOnly
      }
      createdAt
      createdAt
      updatedAt
      signUpDeadline
    }
  }
`;