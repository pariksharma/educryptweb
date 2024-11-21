import React from 'react'

const Button3 = ({value, handleClick}) => {
  return (
    <div>
        <button
            className= "m-0 btn text-decoration-none"
            onClick={handleClick}
          >{value}</button>
    </div>
  )
}

export default Button3