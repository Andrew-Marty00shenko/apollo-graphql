import React, { useState } from "react"; // preserve-line
import { useMutation } from "@apollo/react-hooks"; // preserve-line
import gql from "graphql-tag";

import Button from "../components/button"; // preserve-line
import { GET_LAUNCH } from "./cart-item"; // preserve-line
import * as GetCartItemsTypes from "../pages/__generated__/GetCartItems";
import * as BookTripsTypes from "./__generated__/BookTrips";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { StripeCardElement } from "@stripe/stripe-js";



export const BOOK_TRIPS = gql`
  mutation BookTrips($launchIds: [ID]!, $cardToken: String) {
    bookTrips(launchIds: $launchIds, cardToken: $cardToken) {
      success
      message
      launches {
        id
        isBooked
      }
    }
  }
`;

interface BookTripsProps extends GetCartItemsTypes.GetCartItems { }

const BookTrips: React.FC<BookTripsProps> = ({ cartItems }) => {
  const [load, setLoad] = useState(false);

  const [bookTrips, { data }] = useMutation<
    BookTripsTypes.BookTrips,
    BookTripsTypes.BookTripsVariables
  >(BOOK_TRIPS, {
    variables: { launchIds: cartItems },
    refetchQueries: cartItems.map((launchId) => ({
      query: GET_LAUNCH,
      variables: { launchId },
    })),

    update(cache) {
      cache.writeData({ data: { cartItems: [] } });
    },
  });

  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {



    event.preventDefault();

    if (stripe && elements) {
      try {
        const result = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement) as StripeCardElement,
          billing_details: {
            name: 'Jenny Rosen'
          },
        });

        await bookTrips({
          variables: {
            launchIds: cartItems,
            cardToken: result && result.paymentMethod && result.paymentMethod.id
          } as any
        });
      }
      catch (e) {
        alert(e.message)
        setLoad(false)
      }
    }
  }

  return data && data.bookTrips && !data.bookTrips.success ? (
    <p data-testid="message">{data.bookTrips.message}</p>
  ) : (

      <form onSubmit={handleSubmit}>
        <CardElement />
        <Button disabled={load} type="submit" data-testid="book-button">
          {load ? 'loading...' : 'Book all'}
        </Button>
      </form>
    );
};

export default BookTrips;