import { gql } from "@apollo/client";

export default gql`
  query GetClasses($filter: TeamClassQueryInput!) {
    teamClasses(limit: 1000, query: $filter) {
      _id
      title
      instructorId
      instructorName
      isActive
      onDemand
      variants {
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
        expectedProfit
        pricePersonInstructor
        priceTiers {
          maximum
          minimum
          price
          priceInstructor
        }
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
      category
    }
  }
`;
