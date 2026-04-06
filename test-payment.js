fetch('http://127.0.0.1:5000/api/payments/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 10 })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
