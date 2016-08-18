import * as agent  from 'superagent';

export class RestCalls {

  //'X-RAM-Identity-IdValue': 'PUBLIC_IDENTIFIER:ABN:jenscatering_identity_1'
  private static headers = {};

  private server: string;
  private urlPrefix: string = '/api';

  constructor(private serverAddress: string, private serverPort: number) {
    this.server = `${this.serverAddress}:${this.serverPort}`;
  }

  private buildPath(postfix: string) {
    return this.server + this.urlPrefix + postfix;
  }

  public get = <T>(api: string) => {
      return agent.get(this.buildPath(api)).set(RestCalls.headers).send();
  };

  public post = <T, B>(api: string, body: B) =>
    agent.post(this.buildPath(api)).set(RestCalls.headers).send(body);

  public put = <T, B>(api: string, body: B) =>
    agent.put(this.buildPath(api)).set(RestCalls.headers).send(body);

  public delete = <T>(api: string) =>
    agent.delete(this.buildPath(api)).set(RestCalls.headers);

  public promisify(request: agent.SuperAgentRequest): Promise<agent.Response> {
    return new Promise((resolver, reject) =>
      request.end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolver(res);
        }
      }));
  }

    public setHeader(name:string, value:string) {
      RestCalls.headers[name]=value;
    }
}