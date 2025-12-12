import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

const baseUrl = `http://localhost:3000`;
const k6Url = `${baseUrl}/api/k6/reads`;

export default function () {
  const moviesRes = http.get(`${k6Url}`);
  if (moviesRes.status !== 200) {
    console.log(moviesRes.body);
  }
  check(moviesRes, {
    'k6 status is 200': (r) => r.status === 200,
  });
  sleep(0.1);
}
