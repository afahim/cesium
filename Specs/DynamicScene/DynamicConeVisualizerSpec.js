/*global defineSuite*/
defineSuite([
             'DynamicScene/DynamicConeVisualizer',
             'Specs/createScene',
             'Specs/destroyScene',
             'Specs/MockProperty',
             'DynamicScene/DynamicCone',
             'DynamicScene/DynamicObjectCollection',
             'DynamicScene/DynamicObject',
             'Scene/Material',
             'Core/JulianDate',
             'Core/Quaternion',
             'Core/Cartesian3',
             'Core/Color',
             'Core/Matrix3',
             'Core/Matrix4',
             'Scene/Scene'
            ], function(
              DynamicConeVisualizer,
              createScene,
              destroyScene,
              MockProperty,
              DynamicCone,
              DynamicObjectCollection,
              DynamicObject,
              Material,
              JulianDate,
              Quaternion,
              Cartesian3,
              Color,
              Matrix3,
              Matrix4,
              Scene) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var scene;
    var visualizer;

    beforeAll(function() {
        scene = createScene();
    });

    afterAll(function() {
        destroyScene(scene);
    });

    afterEach(function() {
        visualizer = visualizer && visualizer.destroy();
    });

    it('constructor throws if no scene is passed.', function() {
        expect(function() {
            return new DynamicConeVisualizer();
        }).toThrow();
    });

    it('constructor sets expected parameters.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicConeVisualizer(scene, dynamicObjectCollection);
        expect(visualizer.getScene()).toEqual(scene);
        expect(visualizer.getDynamicObjectCollection()).toEqual(dynamicObjectCollection);
    });

    it('update throws if no time specified.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicConeVisualizer(scene, dynamicObjectCollection);
        expect(function() {
            visualizer.update();
        }).toThrow();
    });

    it('update does nothing if no dynamicObjectCollection.', function() {
        visualizer = new DynamicConeVisualizer(scene);
        visualizer.update(new JulianDate());
    });

    it('isDestroy returns false until destroyed.', function() {
        visualizer = new DynamicConeVisualizer(scene);
        expect(visualizer.isDestroyed()).toEqual(false);
        visualizer.destroy();
        expect(visualizer.isDestroyed()).toEqual(true);
        visualizer = undefined;
    });

    it('object with no cone does not create a primitive.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicConeVisualizer(scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new MockProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new MockProperty(new Quaternion(0, 0, 0, 1));
        visualizer.update(new JulianDate());
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });

    it('object with no position does not create a primitive.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicConeVisualizer(scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.orientation = new MockProperty(new Quaternion(0, 0, 0, 1));
        var cone = testObject.cone = new DynamicCone();
        cone.maximumClockAngle = new MockProperty(1);
        cone.outerHalfAngle = new MockProperty(1);
        visualizer.update(new JulianDate());
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });

    it('object with no orientation does not create a primitive.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicConeVisualizer(scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new MockProperty(new Cartesian3(1234, 5678, 9101112));
        var cone = testObject.cone = new DynamicCone();
        cone.maximumClockAngle = new MockProperty(1);
        cone.outerHalfAngle = new MockProperty(1);
        visualizer.update(new JulianDate());
        expect(scene.getPrimitives().getLength()).toEqual(0);
    });

    it('A DynamicCone causes a ComplexConicSensor to be created and updated.', function() {
        var time = new JulianDate();
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicConeVisualizer(scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new MockProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new MockProperty(new Quaternion(0, 0, 0, 1));

        var cone = testObject.cone = new DynamicCone();
        cone.minimumClockAngle = new MockProperty(0.1);
        cone.maximumClockAngle = new MockProperty(0.2);
        cone.innerHalfAngle = new MockProperty(0.3);
        cone.outerHalfAngle = new MockProperty(0.4);
        cone.intersectionColor = new MockProperty(new Color(0.1, 0.2, 0.3, 0.4));
        cone.showIntersection = new MockProperty(true);
        cone.radius = new MockProperty(123.5);
        cone.show = new MockProperty(true);

        var redMaterial = Material.fromType(scene.getContext(), Material.ColorType);
        redMaterial.uniforms.color = Color.RED;
        var whiteMaterial = Material.fromType(scene.getContext(), Material.ColorType);
        whiteMaterial.uniforms.color = Color.WHITE;
        var blueMaterial = Material.fromType(scene.getContext(), Material.ColorType);
        blueMaterial.uniforms.color = Color.BLUE;
        var yellowMaterial = Material.fromType(scene.getContext(), Material.ColorType);
        yellowMaterial.uniforms.color = Color.YELLOW;
        cone.capMaterial = new MockProperty(redMaterial);
        cone.innerMaterial = new MockProperty(whiteMaterial);
        cone.outerMaterial = new MockProperty(blueMaterial);
        cone.silhouetteMaterial = new MockProperty(yellowMaterial);
        visualizer.update(time);

        expect(scene.getPrimitives().getLength()).toEqual(1);
        var c = scene.getPrimitives().get(0);
        expect(c.minimumClockAngle).toEqual(testObject.cone.minimumClockAngle.getValue(time));
        expect(c.maximumClockAngle).toEqual(testObject.cone.maximumClockAngle.getValue(time));
        expect(c.innerHalfAngle).toEqual(testObject.cone.innerHalfAngle.getValue(time));
        expect(c.outerHalfAngle).toEqual(testObject.cone.outerHalfAngle.getValue(time));
        expect(c.intersectionColor).toEqual(testObject.cone.intersectionColor.getValue(time));
        expect(c.showIntersection).toEqual(testObject.cone.showIntersection.getValue(time));
        expect(c.radius).toEqual(testObject.cone.radius.getValue(time));
        expect(c.show).toEqual(testObject.cone.show.getValue(time));
        expect(c.capMaterial).toEqual(testObject.cone.capMaterial.getValue(time));
        expect(c.innerMaterial).toEqual(testObject.cone.innerMaterial.getValue(time));
        expect(c.outerMaterial).toEqual(testObject.cone.outerMaterial.getValue(time));
        expect(c.silhouetteMaterial).toEqual(testObject.cone.silhouetteMaterial.getValue(time));
        expect(c.modelMatrix).toEqual(Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(testObject.orientation.getValue(time).conjugate()), testObject.position.getValueCartesian(time)));

        cone.show.value = false;
        visualizer.update(time);
        expect(c.show).toEqual(testObject.cone.show.getValue(time));
    });

    it('clear hides cones.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicConeVisualizer(scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new MockProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new MockProperty(new Quaternion(0, 0, 0, 1));
        var cone = testObject.cone = new DynamicCone();
        cone.maximumClockAngle = new MockProperty(1);
        cone.outerHalfAngle = new MockProperty(1);

        var time = new JulianDate();
        expect(scene.getPrimitives().getLength()).toEqual(0);
        visualizer.update(time);
        expect(scene.getPrimitives().getLength()).toEqual(1);
        expect(scene.getPrimitives().get(0).show).toEqual(true);
        dynamicObjectCollection.clear();
        visualizer.update(time);
        expect(scene.getPrimitives().getLength()).toEqual(1);
        expect(scene.getPrimitives().get(0).show).toEqual(false);
    });

    it('Visualizer sets dynamicObject property.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicConeVisualizer(scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new MockProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new MockProperty(new Quaternion(0, 0, 0, 1));
        var cone = testObject.cone = new DynamicCone();
        cone.maximumClockAngle = new MockProperty(1);
        cone.outerHalfAngle = new MockProperty(1);

        var time = new JulianDate();
        visualizer.update(time);
        expect(scene.getPrimitives().get(0).dynamicObject).toEqual(testObject);
    });

    it('setDynamicObjectCollection removes old objects and add new ones.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new MockProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new MockProperty(new Quaternion(0, 0, 0, 1));
        var cone = testObject.cone = new DynamicCone();
        cone.maximumClockAngle = new MockProperty(1);
        cone.outerHalfAngle = new MockProperty(1);

        var dynamicObjectCollection2 = new DynamicObjectCollection();
        var testObject2 = dynamicObjectCollection2.getOrCreateObject('test2');
        testObject2.position = new MockProperty(new Cartesian3(5678, 9101112, 1234));
        testObject2.orientation = new MockProperty(new Quaternion(1, 0, 0, 0));
        var cone2 = testObject2.cone = new DynamicCone();
        cone2.maximumClockAngle = new MockProperty(0.12);
        cone2.outerHalfAngle = new MockProperty(1.1);

        visualizer = new DynamicConeVisualizer(scene, dynamicObjectCollection);

        var time = new JulianDate();

        visualizer.update(time);
        expect(scene.getPrimitives().getLength()).toEqual(1);
        var conePrimitive = scene.getPrimitives().get(0);
        expect(conePrimitive.dynamicObject).toEqual(testObject);

        visualizer.setDynamicObjectCollection(dynamicObjectCollection2);
        visualizer.update(time);
        expect(scene.getPrimitives().getLength()).toEqual(1);
        conePrimitive = scene.getPrimitives().get(0);
        expect(conePrimitive.dynamicObject).toEqual(testObject2);
    });
}, 'WebGL');