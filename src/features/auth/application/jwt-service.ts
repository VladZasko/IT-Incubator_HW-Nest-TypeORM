// /*
// import jwt from 'jsonwebtoken';
// import * as process from 'process';
// export class JwtService {
//   async createJWTAccessToken(userId: string): Promise<{ accessToken: string }> {
//     const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//       expiresIn: 1000,
//     });
//     return {
//       accessToken: token.toString(),
//     };
//   },
//
//   async createJWTRefreshToken(dataRefreshToken: any): Promise<string> {
//     const refreshToken: string = jwt.sign(
//       {
//         deviceId: dataRefreshToken.deviceId,
//         id: dataRefreshToken.userId,
//         issuedAt: dataRefreshToken.issuedAt,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: 2000 },
//     );
//
//     return refreshToken.toString();
//   },
//
//   async getUserIdByAccessToken(token: string): Promise<string | null> {
//     try {
//       const result: any = jwt.verify(token, process.env.JWT_SECRET);
//       return result.id;
//     } catch (error) {
//       return null;
//     }
//   },
//   async getUserIdByRefreshToken(token: string): Promise<any | null> {
//     try {
//       const result: any = jwt.verify(token, process.env.JWT_SECRET);
//       return result;
//     } catch (error) {
//       return null;
//     }
//   },
// };
// */
