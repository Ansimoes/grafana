import { from, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { CustomVariableSupport, DataQueryRequest, DataQueryResponse, VariableSupportType } from '@grafana/data';

import CloudMonitoringDatasource from './datasource';
import { CloudMonitoringVariableQuery } from './types';
import CloudMonitoringMetricFindQuery from './CloudMonitoringMetricFindQuery';
import { CloudMonitoringVariableQueryEditor } from './components/VariableQueryEditor';

export class CloudMonitoringVariableSupport
  implements CustomVariableSupport<CloudMonitoringDatasource, CloudMonitoringVariableQuery> {
  private readonly metricFindQuery: CloudMonitoringMetricFindQuery;

  constructor(private readonly datasource: CloudMonitoringDatasource) {
    this.metricFindQuery = new CloudMonitoringMetricFindQuery(datasource);
    this.query = this.query.bind(this);
  }

  type: VariableSupportType = 'custom';

  editor = CloudMonitoringVariableQueryEditor;

  query(request: DataQueryRequest<CloudMonitoringVariableQuery>): Observable<DataQueryResponse> {
    const executeObservable = from(this.metricFindQuery.execute(request.targets[0]));
    return from(this.datasource.ensureGCEDefaultProject()).pipe(
      mergeMap(() => executeObservable),
      map(data => ({ data }))
    );
  }
}
