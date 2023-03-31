import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function CalorieIntake() {
  // Components in state that we are using for functionality
  const [weight, setWeight] = useState(0);
  const [product, setProduct] = useState('');
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [food, setFood] = useState([]);
  const [total, setTotal] = useState(0);

  // Set food state to be an array of the ingredients tied to the user
  const getAllFoodItems = () => {
    // Sends an axios GET request using the date as a parameter, it fetches a user's calorie intake for that date and renders it to the page or leaves it blank if nothing comes back
    axios.get('/nutrition/product', { params: { q: date } })
      .then((result) => {
        if (result.data !== "") {
          const foodList = result.data.foodList;
          setFood(foodList);
        } else {
          setFood([])
        }
      })
      .catch((err) => {
        console.error('Failed to request:', err);
      });
  }

  // Adds up the total calories in the food state array and sets the total state to be that number
  const setTotalCal = () => {
    // This variable is a holder of the result that we will be setting on our total state
    let totalResult = 0
    // We iterate over the food state array, and add all the calories up together
    food.forEach(item => {
      totalResult += item.calories;
    })
    // Set the total state to be the result of all the calorie numbers combined
    setTotal(totalResult);
  }

  //Sends a GET request to the nutrition api and sets the food array state to have that search result in it
  const handleApiRequest = (event) => {
    axios.get('/nutrition/food', { params: { q: `${weight}g ${product}` } })
      .then((response) => {
        const { items } = response.data;
        const item = items[0]
        setFood(food => [...food, item]);
      })
      .catch((err) => {
        console.error('Failed request to server:', err);
      })
  }

  //Saves the current date's nutrition chart using a POST request, then requests from the db the foodList array and states the food state to be that value
  // Also updates as well
  const handleDBSave = () => {
    alert(`Successfully saved`);
    axios.post('nutrition/food', { foodList: food, date: date })
      .then(getAllFoodItems())
      .catch((err) => {
        console.error('Failed to send request:', err);
      });
  }

  //Deletes the selected date's nutrition chart
  const handleDBDelete = () => {
    axios.delete(`nutrition/food/${date}`, { foodList: food })
      .then(() => {
        getAllFoodItems();
        alert(`Successfully deleted you table`)
      })
      .catch((err) => {
        console.error('Failed to send request', err);
      })
  }

  // This is a handler for when the date changes, it will fetch the calorie table from that date
  const handleDateChange = (newDate) => {
    setDate(newDate);
  }

  // const handleDeleteEntry = (name) => {
  //   setFood((food) => {
  //     return food.filter((item) => item.name !== name)
  //   });
  // }

  //Set to clear out the fields and reset the state when the submit button is pressed
  const clearFields = () => {
    document.getElementById("foodWeight").value = '';
    document.getElementById("foodProduct").value = '';
    setWeight(0);
    setProduct('');
  }

  // Renders the page whenever the date changes
  useEffect(() => {
    getAllFoodItems();
  }, [date]);

  // Renders the page whenever the food array changes
  useEffect(() => {
    setTotalCal();
  }, [food]);

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-gradient-to-t from-sky-600 from-10% via-sky-400 to-sky-50 to-40% py-8 px-6 shadow rounded-lg sm:px-10 drop-shadow-md ml-4">
        <h1 className="block text-sm font-medium text-sky-500">Meal Tracker</h1>
        <svg className="flex-shrink-0"></svg>
        <input
          type="date"
          id="caloriesIn"
          name="caloriesInDate"
          value={date}
          className="w-full border border-sky-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 hover:border-blue-700 text-center"
          onChange={(e) => {
            handleDateChange(e.target.value);
          }}
        ></input>
        <form>
          <div className="pt-3">
            <label for="Measurement" className="block text-md font-medium">Product Weight (g):</label>
            <input id='foodWeight' className="w-full border border-sky-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 hover:border-blue-700 text-center" type='number' onChange={e => setWeight(e.target.value)}></input>
          </div>
          <div className="pt-3">
            <label for="Ingredient" className="block text-md font-medium">Ingredient:</label>
            <input id='foodProduct' className="w-full border border-sky-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 hover:border-blue-700 text-center" type='text' onChange={e => setProduct(e.target.value)}></input>
            <button className="drop-shadow-md ml-2 border-2 w-20 bg-gray-300" type='button' onClick={() => {
              handleApiRequest()
              clearFields();
            }}>Submit</button>
          </div>
        </form>
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10 border border-sky-300" onChange={() => setTotalCal()}>
          <div className="flex items-center">
            <div>
              <div className='pr-10 font-medium'>Product</div>
              {food.map(item => <div className="pl-3">{item.name}</div>)}
            </div>
            <div>
              <div className='pr-10 font-medium'>Weight(g)</div>
              {food.map(item => <div className="pl-5">{item.serving_size_g}</div>)}
            </div>
            <div>
              <div className='font-medium'>Calories</div>
              {food.map(item => <div className="pl-2">{item.calories}</div>)}
            </div>
          </div>
          <br></br>
          <h3 className="font-bold text-md shadow-lg rounded-lg border border-black">Total Calories: {total}</h3>
        </div>
        <div>
          <div class='flex justify-evenly pt-4'>
            <br></br>
            <button type='button' className="w-full border border-sky-300 rounded-md shadow-lg hover:bg-orange-500 active:bg-orange-900 active:text-white bg-white" onClick={() => handleDBSave()}>Save</button>
            <button type='button' className="w-full border border-sky-300 rounded-md shadow-lg hover:bg-orange-500 active:bg-orange-900 active:text-white bg-white" onClick={() => handleDBDelete()}>Delete</button>
          </div>
        </div>
      </div >
    </div>
  )
}

export default CalorieIntake;
