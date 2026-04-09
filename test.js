fetch('http://localhost:5000/api/prs/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ liftName: 'TEST', weight: 10 })
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Data:", await res.json());
}).catch(console.error);
