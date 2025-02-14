import path from 'node:path'
import Dotenv from 'dotenv-webpack'

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src', 'index'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new Dotenv({
      path: './.env',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
}
