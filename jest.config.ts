const config = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    "^@util/(.*)$": "<rootDir>/src/util/$1",
    "^@server-room/(.*)$": "<rootDir>/src/socket-io-room-server/$1"
  }
};

module.exports = config;
