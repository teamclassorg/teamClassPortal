import React from 'react';

const ExpandableTable = ({ data }) => {
  return (
    <>
      <div className="expandable-content p-2">
        <p>
          <span className="font-weight-bold">Shipping Address: </span>
          {data.shippingAddress.address1} {data.shippingAddress.address2} {', '}
          {data.shippingAddress.city} {', '} {data.shippingAddress.state} {data.shippingAddress.country}
        </p>
        <p className="mb-0 pb-0">
          <span className="font-weight-bold">Personalizations: </span>
        </p>
        {data.personalizations.map((item2) => {
          return (
            <ul className="m-0 p-0 ml-2">
              <li>
                {item2.name}: {item2.value}
              </li>
            </ul>
          );
        })}
      </div>
    </>
  );
};

export default ExpandableTable;
