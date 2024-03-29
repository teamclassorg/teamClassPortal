import { gql } from "@apollo/client";

export default gql`
  mutation insertBookingAndCustomer(
    $bookingId: String!
    $date: DateTime!
    $teamClassId: String!
    $classVariant: BookingClassVariantInsertInput!
    $notes: [BookingNoteInsertInput!]
    $instructorId: String
    $instructorName: String
    $customerId: String!
    $customerName: String!
    $eventDurationHours: Float!
    $eventCoordinatorId: String!
    $attendees: Int!
    $classMinimum: Int!
    $pricePerson: Float!
    $salesTax: Float!
    $salesTaxState: String!
    $taxExempt: Boolean!
    $serviceFee: Float!
    $discount: Float!
    $createdAt: DateTime!
    $customerCreatedAt: DateTime!
    $updatedAt: DateTime!
    $signUpDeadline: DateTime
    $status: String!
    $phone: String!
    $email: String!
    $billingAddress: CustomerBillingAddressInsertInput
    $company: String
    $closedReason: String
    $distributorId: String
    $utm_source: String
    $hasInternationalAttendees: Boolean
    $membershipDiscount: Float
    $onDemand: Boolean
  ) {
    upsertOneCustomer(
      query: { _id: $customerId }
      data: {
        _id: $customerId
        name: $customerName
        phone: $phone
        email: $email
        company: $company
        updatedAt: $updatedAt
        createdAt: $customerCreatedAt
        billingAddress: $billingAddress
      }
    ) {
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
    insertOneBooking(
      data: {
        _id: $bookingId
        date: $date
        expirationHours: 48
        classVariant: $classVariant
        notes: $notes
        teamClassId: $teamClassId
        instructorId: $instructorId
        instructorName: $instructorName
        customerId: $customerId
        customerName: $customerName
        eventDurationHours: $eventDurationHours
        eventCoordinatorId: $eventCoordinatorId
        attendees: $attendees
        classMinimum: $classMinimum
        pricePerson: $pricePerson
        serviceFee: $serviceFee
        salesTax: $salesTax
        taxExempt: $taxExempt
        salesTaxState: $salesTaxState
        discount: $discount
        status: $status
        createdAt: $createdAt
        updatedAt: $updatedAt
        signUpDeadline: $signUpDeadline
        closedReason: $closedReason
        distributorId: $distributorId
        utm_source: $utm_source
        hasInternationalAttendees: $hasInternationalAttendees
        membershipDiscount: $membershipDiscount
        onDemand: $onDemand
      }
    ) {
      _id
      teamClassId
      customerId
      customerName
      attendees
      classMinimum
      eventDurationHours
      eventCoordinatorId
      pricePerson
      serviceFee
      salesTax
      salesTaxState
      rushFee
      discount
      status
      closedReason
      eventLink
      signUpStatusLink
      checkoutLink
      taxExempt
      distributorId
      hasInternationalAttendees
      membershipDiscount
      onDemand
      payments {
        amount
        paymentId
        paymentName
        status
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
        minimum
        maximum
        pricePerson
        pricePersonInstructor
        expectedProfit
        hasKit
        groupEvent
        instructorFlatFee
        flatFeeIncludedInPrice
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
    }
  }
`;
