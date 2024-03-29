import { gql } from "@apollo/client";

export default gql`
  query GetClasses($filter: TeamClassQueryInput!) {
    teamClasses(limit: 1000, query: $filter) {
      _id
      title
      instructorId
      instructorName
      additionalInstructors
      duration
      pricePerson
      hasKit
      minimum
      distributorId
      onDemand
      variants {
        title
        notes
        minimum
        maximum
        duration
        pricePerson
        pricePersonInstructor
        expectedProfit
        hasKit
        order
        active
        groupEvent
        instructorFlatFee
        flatFeeIncludedInPrice
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
