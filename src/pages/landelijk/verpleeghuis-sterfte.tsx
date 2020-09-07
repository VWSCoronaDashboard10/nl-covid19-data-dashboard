import BarScale from 'components/barScale';
import { ContentHeader } from 'components/layout/Content';
import { FCWithLayout } from 'components/layout';
import { getNationalLayout } from 'components/layout/NationalLayout';
import { LineChart } from 'components/charts/index';

import CoronaVirus from 'assets/coronavirus.svg';

import siteText from 'locale';

import { DeceasedPeopleNurseryCountDaily } from 'types/data';
import MunicipalityMap from 'components/mapChart/MunicipalityMap';
import { useState } from 'react';
import SafetyRegionMap from 'components/mapChart/SafetyRegionMap';
import ChartRegionControls from 'components/chartRegionControls';
import getNlData, { INationalData } from 'static-props/nl-data';

const text: typeof siteText.verpleeghuis_oversterfte =
  siteText.verpleeghuis_oversterfte;

export function NursingHomeDeathsBarScale(props: {
  data: DeceasedPeopleNurseryCountDaily | undefined;
}) {
  const { data } = props;

  if (!data) return null;

  return (
    <BarScale
      min={0}
      max={50}
      screenReaderText={text.barscale_screenreader_text}
      value={data.last_value.deceased_nursery_daily}
      id="over"
      rangeKey="deceased_nursery_daily"
      gradient={[
        {
          color: '#3391CC',
          value: 0,
        },
      ]}
    />
  );
}

const NursingHomeDeaths: FCWithLayout<INationalData> = (props) => {
  const { data: state } = props;
  const [selectedMap, setSelectedMap] = useState<'municipal' | 'region'>(
    'municipal'
  );

  const data: DeceasedPeopleNurseryCountDaily | undefined =
    state?.deceased_people_nursery_count_daily;

  return (
    <>
      <ContentHeader
        category="Verpleeghuiszorg"
        title={text.titel}
        Icon={CoronaVirus}
        subtitle={text.pagina_toelichting}
        metadata={{
          datumsText: text.datums,
          dateUnix: data?.last_value?.date_of_report_unix,
          dateInsertedUnix: data?.last_value?.date_of_insertion_unix,
          dataSource: text.bron,
        }}
      />

      <article className="metric-article layout-two-column">
        <div className="column-item column-item-extra-margin">
          <h3>{text.barscale_titel}</h3>

          <NursingHomeDeathsBarScale data={data} />
        </div>

        <div className="column-item column-item-extra-margin">
          <p>{text.extra_uitleg}</p>
        </div>
      </article>

      <article className="metric-article layout-two-column">
        <div className="column-item column-item-extra-margin">
          <h3>{text.map_titel}</h3>
          <p>{text.map_toelichting}</p>
          <ChartRegionControls
            onChange={(val: 'region' | 'municipal') => setSelectedMap(val)}
          />
        </div>

        <div className="column-item column-item-extra-margin">
          {selectedMap === 'municipal' && (
            <MunicipalityMap
              metric="deceased"
              gradient={['#9DDEFE', '#0290D6']}
            />
          )}
          {selectedMap === 'region' && (
            <SafetyRegionMap
              metric="deceased"
              gradient={['#9DDEFE', '#0290D6']}
            />
          )}
        </div>
      </article>

      <article className="metric-article">
        <h3>{text.linechart_titel}</h3>

        {data && (
          <LineChart
            values={data.values.map((value) => ({
              value: value.deceased_nursery_daily,
              date: value.date_of_report_unix,
            }))}
          />
        )}
      </article>
    </>
  );
};

NursingHomeDeaths.getLayout = getNationalLayout();

export const getStaticProps = getNlData();

export default NursingHomeDeaths;