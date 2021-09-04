// import axios from "axios";

// function fetchApiData({ startDate, endDate }) {
//   async () => {
//     const response = await axios.get(
//       `https://staging.mymelior.com/v1/branches/1/progress?date_from=${startDate
//         .toISOString()
//         .slice(0, 10)}&date_to=${endDate.toISOString().slice(0, 10)}`,
//       { headers: { Authorization: "Bearer SLSmxK17vjRInEWIiFQjwE1QIDfeSM" } }
//     );
//     return response;
//   };
// }
// export default fetchApiData;

// export default axios.create({
//   baseURL:
//     "https://staging.mymelior.com/v1/branches/1/progress?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD",
//   headers: "Bearer SLSmxK17vjRInEWIiFQjwE1QIDfeSM",
// });

// useEffect(() => {
//   //Fetch data based on the selected date
//   axios
//     .get(
//       `https://staging.mymelior.com/v1/branches/1/progress?date_from=${startDate
//         .toISOString()
//         .slice(0, 10)}&date_to=${endDate.toISOString().slice(0, 10)}`,
//       { headers: { Authorization: "Bearer SLSmxK17vjRInEWIiFQjwE1QIDfeSM" } }
//     )
//     .then((res) => {
//       console.log(res);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// }, [endDate]);
