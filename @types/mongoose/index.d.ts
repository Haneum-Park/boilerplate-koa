import mongoose from 'mongoose';

declare module 'mongoose' {
  export var caramellaConnection: mongoose.Connection | null = mongoose.Connection;
  export var labelingConnection: mongoose.Connection | null = mongoose.Connection;
}
