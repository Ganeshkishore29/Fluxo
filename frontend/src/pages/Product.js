import React from 'react'
import ProductView from '../components/Productview'
import { useParams } from 'react-router-dom';

const Product = () => {
    const { id } = useParams();
  return (
    <>
    <ProductView id={id} />
    </>
  )
}

export default Product