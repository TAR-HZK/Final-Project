import axios from 'axios';

const API_URL = 'http://localhost:5000/api/builds/';

// Create new build
const createBuild = async (buildData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, buildData, config);
  return response.data;
};

// Get all public community builds
const getBuilds = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const buildService = {
  createBuild,
  getBuilds,
};

export default buildService;