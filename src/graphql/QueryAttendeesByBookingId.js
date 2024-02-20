import { gql } from "@apollo/client";

export default gql`
  query ListAttendees($bookingId: String!) {
    attendees(query: { bookingId: $bookingId }, limit: 1000) {
      _id
      bookingId
      name
      addressLine1
      addressLine2
      additionalFields {
        name
        order
        value
      }
      city
      state
      zip
      country
      email
      phone
      canDeliverKit
      canDeliverKitReason
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
      additionalCost
      updatedAt
      createdAt
      status
      instructorOrDistributorId
      statusNotes
    }
  }
`;

