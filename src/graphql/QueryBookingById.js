import { gql } from '@apollo/client';

export default gql`
  query GetBooking($bookingId: String!) {
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
        instructorFlatFee
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
      notes {
        note
        author
        date
        shared
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
      distributorId
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
      distributorId
      invoiceDetails {
        item
        unitPrice
        units
        priceEditable
        unitsEditable
        taxable
        readOnly
      }
      instructorInvoice {
        createdAt
        invoiceItems {
          description
          price
          units
        }
        notes
        rejectedReasons
        status
        updatedAt
        paymentReceipt
      }
      distributorInvoice {
        createdAt
        invoiceItems {
          description
          price
          units
        }
        notes
        rejectedReasons
        status
        updatedAt
        paymentReceipt
      }
      createdAt
      createdAt
      updatedAt
      signUpDeadline
      preEventSurvey {
        aboutTeam
        conferenceLink
        engagement
        eventDuration
        eventPurpose
        eventSpeed
        eventType
        formality
        hostName
        introOutro
        ownLink
        submittedAt
      }
      signUpPageSettings {
        invitationFrom
        additionalCopyToShow
        additionalRegistrationFields {
          label
          placeholder
          type
          listItems
          required
          active
          order
        }
      }
    }
  }
`;
