/**
 * Module: For Responses
 */

export class ApiResponse {
  successResponse: any;
  failResponse: any;

  constructor() {
    this.successResponse = {
      status: "success",
      api_version: "1.0.0",
      api_code: 1,
      response: {
        data: [],
      },
    };

    this.failResponse = {
      status: "fail",
      api_version: "1.0.0",
      api_code: 1,
      error: [],
    };
  }
}