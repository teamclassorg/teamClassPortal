import { gql } from "@apollo/client";

export default gql`
  query ExampleQuery($query: AttendeeQueryInput, $limit: Int, $sortBy: AttendeeSortByInput) {
    attendees(query: $query, limit: $limit, sortBy: $sortBy) {
      zip
      updatedAt
      statusNotes
      status
      state
      phone
      name
      lateRegistrationAnswerDate
      kitFullFitment {
        carrier
        checkpoints {
          checkpoint_time
          created_at
          message
          raw_tag
          slug
          subtag
          subtag_message
          tag
        }
        expected_delivery
        fullfitmentBy
        fullfitmentDate
        last_updated_at
        shipmentTrackingNumber
        slug
        status
        trackingStatusId
      }
      instructorOrDistributorId
      email
      dietaryRestrictions
      createdAt
      country
      city
      canDeliverKitReason
      canDeliverKit
      bookingId
      addressLine2
      addressLine1
      additionalFields {
        value
        order
        name
      }
      additionalCost
      _id
    }
  }
`;

