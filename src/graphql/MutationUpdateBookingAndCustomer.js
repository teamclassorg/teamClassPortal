import { gql } from "@apollo/client";

export default gql`
  mutation updateBookingAndCustomer(
    $bookingId: String!
    $date: DateTime!
    $teamClassId: String!
    $classVariant: BookingClassVariantUpdateInput!
    $notes: [BookingNoteUpdateInput!]
    $addons: [BookingAddonUpdateInput]
    $instructorId: String
    $instructorName: String
    $customerId: String!
    $customerName: String!
    $eventDate: DateTime!
    $eventDurationHours: Float
    $eventCoordinatorId: String!
    $attendees: Int!
    $classMinimum: Int!
    $pricePerson: Float!
    $salesTax: Float!
    $serviceFee: Float!
    $discount: Float!
    $createdAt: DateTime!
    $updatedAt: DateTime!
    $signUpDeadline: DateTime
    $phone: String!
    $email: String!
    $company: String
    $capRegistration: Boolean
    $joinInfo: BookingJoinInfoUpdateInput
    $joinInfo_unset: Boolean
    $shippingTrackingLink: String
    $distributorId: String
    $distributorId_unset: Boolean
    $additionalClassOptions: [BookingAdditionalClassOptionUpdateInput]
    $tags: [String]
    $hasInternationalAttendees: Boolean
    $onDemand: Boolean
  ) {
    updateOneCustomer(
      query: { _id: $customerId }
      set: { _id: $customerId, name: $customerName, phone: $phone, email: $email, company: $company, updatedAt: $updatedAt }
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
    updateOneCalendarEvent(query: { bookingId: $bookingId }, set: { classId: $teamClassId }) {
      _id
      classId
      bookingId
      year
      month
      day
      fromHour
      fromMinutes
      toHour
      toMinutes
      status
      rushFee
    }
    updateOneBooking(
      query: { _id: $bookingId }
      set: {
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
        eventDate: $eventDate
        eventDurationHours: $eventDurationHours
        eventCoordinatorId: $eventCoordinatorId
        attendees: $attendees
        classMinimum: $classMinimum
        pricePerson: $pricePerson
        serviceFee: $serviceFee
        salesTax: $salesTax
        discount: $discount
        createdAt: $createdAt
        updatedAt: $updatedAt
        signUpDeadline: $signUpDeadline
        capRegistration: $capRegistration
        joinInfo: $joinInfo
        joinInfo_unset: $joinInfo_unset
        shippingTrackingLink: $shippingTrackingLink
        distributorId: $distributorId
        distributorId_unset: $distributorId_unset
        additionalClassOptions: $additionalClassOptions
        tags: $tags
        addons: $addons
        hasInternationalAttendees: $hasInternationalAttendees
        onDemand: $onDemand
      }
    ) {
      _id
      teamClassId
      onDemand
      customerId
      customerName
      attendees
      classMinimum
      eventDurationHours
      eventCoordinatorId
      pricePerson
      serviceFee
      salesTax
      rushFee
      discount
      status
      closedReason
      capRegistration
      eventLink
      signUpStatusLink
      checkoutLink
      taxExempt
      distributorId
      hasInternationalAttendees
      tags
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
      additionalClassOptions {
        groupId
        text
      }
      shippingTrackingLink
      joinInfo {
        eventId
        joinUrl
        manualLink
        password
      }
      addons {
        active
        color
        description
        icon
        multipleUnits
        order
        name
        unit
        unitPrice
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
    }
  }
`;
