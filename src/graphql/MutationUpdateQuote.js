import { gql } from "@apollo/client";

export default gql`
  mutation updateQuote(
    $bookingId: String!
    $customerId: String!
    $name: String!
    $phone: String!
    $email: String!
    $company: String
    $updatedAt: DateTime!
  ) {
    updateOneCustomer(query: { _id: $customerId }, set: { name: $name, phone: $phone, email: $email, company: $company, updatedAt: $updatedAt }) {
      _id
      name
      email
      phone
      company
      billingAddress {
        addressLine1
        addressLine2
        city
        state
        country
        zip
      }
      createdAt
      updatedAt
    }
    updateOneBooking(query: { _id: $bookingId }, set: { customerName: $name, updatedAt: $updatedAt }) {
      _id
      date
      expirationHours
      teamClassId
      eventCoordinatorId
      onDemand
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
        instructorFlatFee
        flatFeeIncludedInPrice
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
        refund {
          createdAt
          refundAmount
          refundId
          refundReasons
        }
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
      eventLink
      signUpStatusLink
      checkoutLink
      taxExempt
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
    }
  }
`;
