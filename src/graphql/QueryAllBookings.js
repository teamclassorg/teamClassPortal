import { gql } from "@apollo/client";

export default gql`
  query GetBookings($filter: BookingQueryInput!, $limit: Int!) {
    bookings(limit: $limit, query: $filter, sortBy: UPDATEDAT_DESC) {
      _id
      teamClassId
      customerId
      customerName
      attendees
      classMinimum
      eventDurationHours
      eventCoordinatorId
      hasInternationalAttendees
      pricePerson
      serviceFee
      salesTax
      rushFee
      discount
      status
      closedReason
      eventLink
      signUpStatusLink
      checkoutLink
      taxExempt
      onDemand
      payments {
        amount
        paymentId
        paymentName
        status
        createdAt
        refund {
          createdAt
          refundAmount
          refundId
          refundReasons
        }
      }
      notes {
        note
        author
        date
      }
      classVariant {
        title
        notes
        minimum
        maximum
        duration
        pricePerson
        instructorFlatFee
        flatFeeIncludedInPrice
        pricePersonInstructor
        expectedProfit
        hasKit
        order
        active
        groupEvent
        registrationFields {
          label
          placeholder
          type
          listItems
          required
          active
          order
        }
      }
      createdAt
      updatedAt
      signUpDeadline
      capRegistration
    }
  }
`;
